"use client";

import React, { useState } from 'react';
import { useProducts } from './ProductsContext';
import { Product } from './types';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  PackageCheck,
  Check
} from 'lucide-react';

interface ImportExportTabProps {
  onImportComplete?: () => void;
}

export function ImportExportTab({ onImportComplete }: ImportExportTabProps) {
  const { products, categories, importProducts } = useProducts();
  const [selectedExportCategory, setSelectedExportCategory] = useState('All');
  
  // Import State
  const [dragActive, setDragActive] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // 1. Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = [
      'Name,SKU,Barcode,Category,Brand,CostPrice,MRP,SellingPrice,Stock,MinStockAlert,Unit,Status',
      'Artisan Columbian Roast,COF-010,8909990001,Coffee,Origins Roastery,11.50,22.00,19.00,40,10,pack,Active',
      'Double Wall Glass Mug 350ml,EQP-205,8909990002,Equipment,Hario,8.00,18.00,15.00,25,5,pcs,Active',
      'Vanilla Caramel Flavor Syrup,SYR-401,8909990003,Syrups & Flavors,Monin,6.50,14.00,12.00,30,8,bottle,Active'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample-products-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Export Catalog CSV
  const handleExportCatalog = () => {
    const exportList = selectedExportCategory === 'All'
      ? products
      : products.filter(p => p.category === selectedExportCategory);

    const headers = ['ID', 'Name', 'SKU', 'Barcode', 'Category', 'Brand', 'CostPrice', 'MRP', 'SellingPrice', 'DiscountPercent', 'Stock', 'MinStockAlert', 'Unit', 'Status', 'HasVariants'];
    const rows = exportList.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.barcode || '',
      `"${p.category}"`,
      `"${p.brand}"`,
      p.costPrice,
      p.mrp,
      p.sellingPrice,
      p.discountPercent,
      p.stock,
      p.minStockAlert,
      p.unit,
      p.status,
      p.hasVariants ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `store-catalog-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. File Upload & Parse
  const processFile = (file: File) => {
    setParseError('');
    setImportSuccess(false);
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
        const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

        const nameIdx = headers.findIndex(h => h === 'name' || h === 'product name');
        const skuIdx = headers.findIndex(h => h === 'sku');
        const barcodeIdx = headers.findIndex(h => h === 'barcode');
        const categoryIdx = headers.findIndex(h => h === 'category');
        const brandIdx = headers.findIndex(h => h === 'brand');
        const costPriceIdx = headers.findIndex(h => h === 'costprice' || h === 'cost');
        const mrpIdx = headers.findIndex(h => h === 'mrp');
        const priceIdx = headers.findIndex(h => h === 'sellingprice' || h === 'price');
        const stockIdx = headers.findIndex(h => h === 'stock' || h === 'quantity');
        const unitIdx = headers.findIndex(h => h === 'unit');

        if (nameIdx === -1 || skuIdx === -1) {
          setParseError('Missing required columns: "Name" and "SKU" must be present.');
          return;
        }

        const parsed: Product[] = [];
        for (let i = 1; i < lines.length; i++) {
          const rawCols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (rawCols.length < 2) continue;

          const productName = rawCols[nameIdx] || `Product ${i}`;
          const productSku = rawCols[skuIdx] || `SKU-IMP-${i}`;
          const barcode = barcodeIdx !== -1 ? rawCols[barcodeIdx] : '';
          const category = categoryIdx !== -1 ? rawCols[categoryIdx] : 'Coffee';
          const brand = brandIdx !== -1 ? rawCols[brandIdx] : 'BaristaPro';
          const cost = costPriceIdx !== -1 ? parseFloat(rawCols[costPriceIdx]) || 10 : 10;
          const itemMrp = mrpIdx !== -1 ? parseFloat(rawCols[mrpIdx]) || 20 : 20;
          const sellingPrice = priceIdx !== -1 ? parseFloat(rawCols[priceIdx]) || 18 : 18;
          const stock = stockIdx !== -1 ? parseInt(rawCols[stockIdx]) || 20 : 20;
          const unit = unitIdx !== -1 ? rawCols[unitIdx] : 'pcs';

          const discountPercent = itemMrp > 0 && itemMrp > sellingPrice
            ? Number((((itemMrp - sellingPrice) / itemMrp) * 100).toFixed(1))
            : 0;

          parsed.push({
            id: Date.now() + i,
            name: productName,
            sku: productSku,
            barcode,
            category,
            brand,
            costPrice: cost,
            mrp: itemMrp,
            sellingPrice,
            discountPercent,
            stock,
            minStockAlert: 5,
            unit,
            status: stock > 0 ? 'Active' : 'Out of Stock',
            hasVariants: false,
            createdAt: new Date().toISOString().split('T')[0],
          });
        }

        if (parsed.length === 0) {
          setParseError('No valid product rows could be parsed.');
        } else {
          setParsedProducts(parsed);
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

  const handleConfirmImport = () => {
    if (parsedProducts.length === 0) return;
    importProducts(parsedProducts);
    setImportSuccess(true);
    setParsedProducts([]);
    setFileName('');
    if (onImportComplete) {
      setTimeout(() => onImportComplete(), 1500);
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
              Download your entire store catalog with SKUs, barcodes, pricing, stock levels, and variants as a CSV spreadsheet.
            </p>

            <div className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Filter by Category</label>
                <select
                  value={selectedExportCategory}
                  onChange={(e) => setSelectedExportCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Categories ({products.length} products)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({products.filter(p => p.category === c.name).length} products)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>File Format:</span>
                  <span className="font-semibold text-slate-800">CSV (.csv)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Export Count:</span>
                  <span className="font-semibold text-[#159A1D]">
                    {selectedExportCategory === 'All' ? products.length : products.filter(p => p.category === selectedExportCategory).length} items
                  </span>
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
              className="px-5 py-2.5 bg-[#159A1D] hover:bg-[#128218] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download size={15} /> Export Catalog (.csv)
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
              Upload hundreds of products simultaneously via CSV or Excel file with auto-mapped headers.
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
                Supported formats: CSV (Comma separated values)
              </p>
            </div>

            {fileName && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800">
                <span className="truncate max-w-[280px] font-medium">Selected: {fileName}</span>
                <span className="font-bold">{parsedProducts.length} items parsed</span>
              </div>
            )}

            {parseError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs text-green-700">
                <CheckCircle size={16} className="shrink-0" />
                <span>Products successfully imported to the catalog!</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleDownloadTemplate}
              className="text-xs font-semibold text-[#159A1D] hover:underline flex items-center gap-1.5"
            >
              <Download size={14} /> Download Sample CSV
            </button>

            <button
              disabled={parsedProducts.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PackageCheck size={16} /> Confirm Import ({parsedProducts.length})
            </button>
          </div>
        </div>
      </div>

      {/* 4. Parsed Import Preview Table */}
      {parsedProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Preview Uploaded Products</h4>
              <p className="text-xs text-slate-400">Review parsed rows before committing them to the catalog</p>
            </div>
            <button
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-[#159A1D] hover:bg-[#128218] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Check size={14} /> Commit & Add {parsedProducts.length} Items
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3 text-right">MRP</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3 text-center">Stock</th>
                  <th className="p-3 text-center">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">{p.category}</span>
                    </td>
                    <td className="p-3 text-slate-600">{p.brand}</td>
                    <td className="p-3 text-right text-slate-400">${p.mrp.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-[#159A1D]">${p.sellingPrice.toFixed(2)}</td>
                    <td className="p-3 text-center font-bold text-slate-700">{p.stock}</td>
                    <td className="p-3 text-center text-slate-500">{p.unit}</td>
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
