"use client";

import React, { useState } from 'react';
import { useProducts } from './ProductsContext';
import { Select } from '@/components/pos/common';
import { BulkImportResponse } from '@/hooks/queries/posProducts';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  PackageCheck, 
  Check,
  Loader2
} from 'lucide-react';

interface ImportExportTabProps {
  onImportComplete?: () => void;
}

interface ParsedPreviewRow {
  name: string;
  variantTitle: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  costPrice: number;
  mrp: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  status: string;
}

export function ImportExportTab({ onImportComplete }: ImportExportTabProps) {
  const { categories, pagination, exportCatalog, importCatalogFile } = useProducts();
  const [selectedExportCategory, setSelectedExportCategory] = useState('All');
  const [isExporting, setIsExporting] = useState(false);
  
  // Import State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedPreviewRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<BulkImportResponse | null>(null);

  // 1. Download Blank/Sample CSV Template (1-2 products with variants)
  const handleDownloadTemplate = () => {
    const csvContent = [
      'Product Name,Category,Brand,Description,Variant / Measure,SKU,Barcode,Cost Price,MRP,Selling Price,Available Stock,Min Stock Alert,Status',
      'Artisan Arabica Whole Bean,Coffee & Beans,Origins Roastery,Highland single origin roasted beans,250g Whole Bean,COF-010-250G,8901001001,9.00,18.00,15.00,50,10,Active',
      'Artisan Arabica Whole Bean,Coffee & Beans,Origins Roastery,Highland single origin roasted beans,500g Whole Bean,COF-010-500G,8901001002,16.00,32.00,28.00,30,8,Active',
      'Madagascar Vanilla Syrup,Syrups & Flavors,Monin,Pure cane cafe flavoring syrup,250ml Bottle,SYR-001-250ML,8901004001,4.00,9.00,7.50,45,10,Active',
      'Madagascar Vanilla Syrup,Syrups & Flavors,Monin,Pure cane cafe flavoring syrup,750ml Bottle,SYR-001-750ML,8901004002,7.50,16.00,13.50,60,15,Active'
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample-products-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // 3. Export Entire Database Catalog via Backend API
  const handleExportCatalog = async () => {
    try {
      setIsExporting(true);
      await exportCatalog({
        category: selectedExportCategory === 'All' ? undefined : selectedExportCategory,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Client-side preview parser
  const processFile = (file: File) => {
    setParseError('');
    setImportSummary(null);
    setSelectedFile(file);
    setFileName(file.name);

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setParseError('Please upload a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          setParseError('CSV file is empty or contains only headers.');
          return;
        }

        const headerLine = lines[0];
        const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''));

        const nameIdx = headers.findIndex(h => ['productname', 'name', 'product', 'title'].includes(h));
        const variantIdx = headers.findIndex(h => ['variantmeasure', 'variant', 'measure', 'variantname', 'size'].includes(h));
        const skuIdx = headers.findIndex(h => ['sku', 'code'].includes(h));
        const barcodeIdx = headers.findIndex(h => ['barcode', 'upc', 'ean'].includes(h));
        const categoryIdx = headers.findIndex(h => ['category', 'categoryname'].includes(h));
        const brandIdx = headers.findIndex(h => ['brand', 'brandname'].includes(h));
        const costPriceIdx = headers.findIndex(h => ['costprice', 'cost'].includes(h));
        const mrpIdx = headers.findIndex(h => ['mrp', 'retailprice'].includes(h));
        const priceIdx = headers.findIndex(h => ['sellingprice', 'price'].includes(h));
        const stockIdx = headers.findIndex(h => ['availablestock', 'stockquantity', 'stock', 'qty', 'quantity'].includes(h));
        const alertIdx = headers.findIndex(h => ['minstockalert', 'minalert', 'alert'].includes(h));
        const statusIdx = headers.findIndex(h => ['status'].includes(h));

        if (nameIdx === -1) {
          setParseError('Missing required column: "Product Name" (or "Name") must be present in header row.');
          return;
        }

        const parsed: ParsedPreviewRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const rawCols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (rawCols.length < 2) continue;

          const productName = rawCols[nameIdx] || `Product ${i}`;
          const variantTitle = variantIdx !== -1 ? rawCols[variantIdx] || 'Standard' : 'Standard';
          const productSku = skuIdx !== -1 ? rawCols[skuIdx] || `SKU-IMP-${i}` : `SKU-IMP-${i}`;
          const barcode = barcodeIdx !== -1 ? rawCols[barcodeIdx] : '';
          const category = categoryIdx !== -1 ? rawCols[categoryIdx] || 'Coffee & Beans' : 'Coffee & Beans';
          const brand = brandIdx !== -1 ? rawCols[brandIdx] || 'Generic' : 'Generic';
          const cost = costPriceIdx !== -1 ? parseFloat(rawCols[costPriceIdx]) || 10 : 10;
          const itemMrp = mrpIdx !== -1 ? parseFloat(rawCols[mrpIdx]) || 20 : 20;
          const sellingPrice = priceIdx !== -1 ? parseFloat(rawCols[priceIdx]) || 18 : 18;
          const stock = stockIdx !== -1 ? parseInt(rawCols[stockIdx], 10) || 0 : 0;
          const minAlert = alertIdx !== -1 ? parseInt(rawCols[alertIdx], 10) || 5 : 5;
          const status = statusIdx !== -1 && rawCols[statusIdx]?.toLowerCase() === 'draft' ? 'Draft' : 'Active';

          parsed.push({
            name: productName,
            variantTitle,
            sku: productSku,
            barcode,
            category,
            brand,
            costPrice: cost,
            mrp: itemMrp,
            sellingPrice,
            stock,
            minStockAlert: minAlert,
            status,
          });
        }

        if (parsed.length === 0) {
          setParseError('No valid product rows could be parsed from the file.');
        } else {
          setParsedRows(parsed);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown parsing error';
        setParseError(`Failed to parse file: ${errorMsg}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // 5. Submit Bulk Import to Backend API
  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    try {
      setIsImporting(true);
      setParseError('');
      const res = await importCatalogFile(selectedFile);
      setImportSummary(res);
      setParsedRows([]);
      setSelectedFile(null);
      setFileName('');
      if (onImportComplete) {
        setTimeout(() => onImportComplete(), 2000);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to import products';
      setParseError(errorMsg);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Export Products Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Download size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Export Catalog</h3>
            <p className="text-xs text-slate-500 mt-1">
              Download your product catalog as a CSV spreadsheet. Includes all SKUs, barcodes, pricing, stock levels, and measures.
            </p>

            <div className="mt-5 space-y-3">
              <Select
                label="Filter by Category"
                value={selectedExportCategory}
                onChange={setSelectedExportCategory}
                options={[
                  { value: 'All', label: `All Categories (${pagination.total} products)` },
                  ...categories.map(c => ({
                    value: c.name,
                    label: `${c.name} (${c.productCount} products)`
                  }))
                ]}
              />

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Export Scope:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedExportCategory === 'All' ? `All Products (${pagination.total})` : selectedExportCategory}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>File Format:</span>
                  <span className="font-semibold text-slate-800">CSV (.csv RFC-4180)</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Category:</span>
                  <span className="font-semibold text-slate-800">{selectedExportCategory}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleDownloadTemplate}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <FileSpreadsheet size={15} className="text-slate-400" />
              Download Template
            </button>

            <button
              onClick={handleExportCatalog}
              disabled={isExporting}
              className="px-5 py-2.5 bg-[#159A1D] hover:bg-[#128218] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isExporting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Exporting Catalog...
                </>
              ) : (
                <>
                  <Download size={15} /> Export Catalog (.csv)
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Import Products Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Upload size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Bulk Import Products</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload hundreds of products simultaneously via CSV. Auto-detects product variants, measures, categories, and inventory stock levels.
            </p>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`mt-5 border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive
                  ? 'border-[#159A1D] bg-green-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <FileText size={32} className="mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">
                Drag and drop your .csv file here, or
              </p>
              <label className="inline-block mt-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs">
                Browse File
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-2">
                Supported formats: CSV (UTF-8, comma separated values)
              </p>
            </div>

            {fileName && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800">
                <span className="truncate max-w-[280px] font-medium">Selected: {fileName}</span>
                <span className="font-bold">{parsedRows.length} items parsed</span>
              </div>
            )}

            {parseError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {importSummary && (
              <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>{importSummary.message}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="bg-white/90 p-2 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block">Products Created</span>
                    <strong className="text-emerald-700 text-sm">{importSummary.data.productsCreated}</strong>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block">Variants Created</span>
                    <strong className="text-emerald-700 text-sm">{importSummary.data.variantsCreated}</strong>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block">Categories Created</span>
                    <strong className="text-emerald-700 text-sm">{importSummary.data.categoriesCreated}</strong>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block">Brands Created</span>
                    <strong className="text-emerald-700 text-sm">{importSummary.data.brandsCreated}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              title="Download sample CSV template with 1-2 products and variants"
            >
              <FileSpreadsheet size={15} className="text-slate-400" />
              Download Sample Template (.csv)
            </button>

            <button
              disabled={parsedRows.length === 0 || isImporting}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isImporting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Importing to Database...
                </>
              ) : (
                <>
                  <PackageCheck size={16} /> Confirm Import ({parsedRows.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Parsed Import Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Preview Uploaded Products ({parsedRows.length} Variants)</h4>
              <p className="text-xs text-slate-400">Review parsed rows before committing them to your store database</p>
            </div>
            <button
              disabled={isImporting}
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-[#159A1D] hover:bg-[#128218] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isImporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Committing...
                </>
              ) : (
                <>
                  <Check size={14} /> Commit & Import {parsedRows.length} Items
                </>
              )}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Variant / Measure</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3 text-right">Cost Price</th>
                  <th className="p-3 text-right">MRP</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3 text-center">Available Stock</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="p-3 text-purple-700 font-medium">{p.variantTitle}</td>
                    <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">{p.category}</span>
                    </td>
                    <td className="p-3 text-slate-600">{p.brand}</td>
                    <td className="p-3 text-right text-slate-500">${p.costPrice.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-400 line-through">${p.mrp.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-[#159A1D]">${p.sellingPrice.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold border border-emerald-100">
                        {p.stock} available
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
