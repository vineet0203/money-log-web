import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | moneylog.com",
  description: "Privacy Policy for moneylog.com.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-[#f8fafc] pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pb-24">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-7 flex flex-col gap-3 sm:mb-9">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xs text-slate-500 sm:text-sm">Last updated: September 27, 2026</p>
        </div>

        {/* Document */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8 lg:p-12">
          <div className="text-left [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We use Your Personal Data to provide and improve the Service. We collect, use, and disclose Your information as described in this Privacy Policy and, where required by applicable law, only where We have a valid legal basis to do so, including Your consent (where consent is required). This Privacy Policy has been created with the help of the <a className="font-medium text-brand-green underline decoration-1 underline-offset-2 transition-colors hover:text-brand-green-dark" href="https://www.termsfeed.com/privacy-policy-generator/" target="_blank" rel="noreferrer">Privacy Policy Generator</a>.</p>
            
            <h2 className="mt-10 mb-4 border-b border-slate-200 pb-2.5 text-xl font-bold tracking-tight text-blue-950 sm:text-[1.375rem]">Interpretation and Definitions</h2>
            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Interpretation</h3>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
            
            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Definitions</h3>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">For the purposes of this Privacy Policy:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li><strong className="font-semibold text-slate-900">Account</strong> means a unique account created for You to access Our Service or parts of Our Service.</li>
              <li><strong className="font-semibold text-slate-900">Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
              <li><strong className="font-semibold text-slate-900">Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Privacy Policy) refers to Computerlog LLC, 7920 Belt Line Rd Suite 245 Suite 720,.</li>
              <li><strong className="font-semibold text-slate-900">Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website, among its many uses.</li>
              <li><strong className="font-semibold text-slate-900">Country/State</strong> refers to: Texas, United States.</li>
              <li><strong className="font-semibold text-slate-900">Device</strong> means any device that can access the Service, such as a computer, a cell phone or a digital tablet.</li>
              <li>
                <strong className="font-semibold text-slate-900">Personal Data</strong> (or &quot;Personal Information&quot;) is any information that relates to an identified or identifiable individual.
                <br /><br />
                We use &quot;Personal Data&quot; and &quot;Personal Information&quot; interchangeably unless a law uses a specific term.
              </li>
              <li><strong className="font-semibold text-slate-900">Service</strong> refers to the Website.</li>
              <li><strong className="font-semibold text-slate-900">Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
              <li><strong className="font-semibold text-slate-900">Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
              <li><strong className="font-semibold text-slate-900">User</strong> means any individual who accesses or uses the Service.</li>
              <li><strong className="font-semibold text-slate-900">Website</strong> refers to moneylog.com, accessible from <a className="font-medium text-brand-green underline decoration-1 underline-offset-2 transition-colors hover:text-brand-green-dark" href="http://www.moneylog.com" rel="external nofollow noopener" target="_blank">http://www.moneylog.com</a>.</li>
              <li><strong className="font-semibold text-slate-900">You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
            </ul>

            <h2 className="mt-10 mb-4 border-b border-slate-200 pb-2.5 text-xl font-bold tracking-tight text-blue-950 sm:text-[1.375rem]">Collecting and Using Your Personal Information</h2>
            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Types of Data Collected</h3>
            <h4 className="mt-6 mb-2 text-[15px] font-semibold text-slate-800">Personal Data</h4>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li>Phone number</li>
            </ul>
            <h4 className="mt-6 mb-2 text-[15px] font-semibold text-slate-800">Usage Data</h4>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Usage Data is collected automatically when using the Service.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Usage Data may include information such as Your Device&apos;s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of Our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device&apos;s unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.</p>
            
            <h4 className="mt-6 mb-2 text-[15px] font-semibold text-slate-800">Tracking Technologies and Cookies</h4>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We use tracking technologies (such as cookies) to track the activity and to improve Our Service. The technologies We use may include:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li><strong className="font-semibold text-slate-900">Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of Our Service.</li>
              <li><strong className="font-semibold text-slate-900">Web Beacons.</strong> Certain sections of Our Service may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>
            </ul>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Where required by law, We use non-essential cookies (that is, Cookies other than the Necessary / Essential Cookies described below) only with Your consent. You can withdraw or change Your consent at any time using Our cookie preferences tool (if available) or through Your browser/device settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We use both Session and Persistent Cookies for the purposes set out below:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li>
                <strong className="font-semibold text-slate-900">Necessary / Essential Cookies</strong>
                <br /><br />
                Type: Session Cookies<br />
                Administered by: Us<br />
                Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.
              </li>
              <li>
                <strong className="font-semibold text-slate-900">Cookies Policy / Notice Acceptance Cookies</strong>
                <br /><br />
                Type: Persistent Cookies<br />
                Administered by: Us<br />
                Purpose: These Cookies identify whether users have accepted the use of cookies on the Website and record the consent choices You have made, so that We can honor those choices on future visits.
              </li>
              <li>
                <strong className="font-semibold text-slate-900">Functionality Cookies</strong>
                <br /><br />
                Type: Persistent Cookies<br />
                Administered by: Us<br />
                Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering Your Account login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter Your preferences every time You use the Website.
              </li>
            </ul>

            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Use of Your Personal Data</h3>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">The Company may use Personal Data for the following purposes:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li><strong className="font-semibold text-slate-900">To provide and maintain Our Service</strong>, including to monitor the usage of Our Service.</li>
              <li><strong className="font-semibold text-slate-900">To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</li>
              <li><strong className="font-semibold text-slate-900">For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</li>
              <li><strong className="font-semibold text-slate-900">To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application&apos;s push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</li>
              <li><strong className="font-semibold text-slate-900">To provide You</strong> with news, special offers, and general information about other goods, services and events which We offer that are similar to those that You have already purchased or inquired about. We send such marketing communications only where permitted by applicable law: where prior consent is required (for example, under the laws applicable in the EEA and the UK), We will send them only with Your consent; otherwise, We may send them until You opt out. You may opt out or withdraw Your consent at any time by using the unsubscribe link in any marketing email We send or by contacting Us.</li>
              <li><strong className="font-semibold text-slate-900">To manage Your requests:</strong> To attend and manage Your requests to Us.</li>
              <li><strong className="font-semibold text-slate-900">For business transfers:</strong> We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about Our Service users is among the assets transferred.</li>
              <li><strong className="font-semibold text-slate-900">For other purposes:</strong> We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of Our promotional campaigns, and evaluating and improving Our Service, products, services, marketing and Your experience.</li>
            </ul>

            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We may share Your Personal Data in the following situations:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li><strong className="font-semibold text-slate-900">With Service Providers:</strong> We may share Your Personal Data with Service Providers to monitor and analyze the use of Our Service, and to contact You.</li>
              <li><strong className="font-semibold text-slate-900">For business transfers:</strong> We may share or transfer Your Personal Data in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
              <li><strong className="font-semibold text-slate-900">With Affiliates:</strong> We may share Your Personal Data with Our affiliates, in which case We will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>
              <li><strong className="font-semibold text-slate-900">With other users:</strong> If Our Service offers public areas, when You share Personal Data or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside the Service.</li>
              <li><strong className="font-semibold text-slate-900">With Your consent:</strong> We may disclose Your Personal Data for any other purpose with Your consent.</li>
            </ul>

            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Retention of Your Personal Data</h3>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with Our legal obligations (for example, if We are required to retain Your data to comply with applicable laws), resolve disputes, and enforce Our legal agreements and policies.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data. Unless otherwise stated, the retention periods below are maximum periods (&quot;up to&quot;) and We may delete or anonymize data sooner when it is no longer needed for the relevant purpose. We apply different retention periods to different categories of Personal Data based on the purpose of processing and legal obligations:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li>
                Account Information
                <ul className="mt-2 mb-1 list-[circle] space-y-2 pl-5 marker:text-slate-400">
                  <li>User Accounts: retained for the duration of Your Account relationship plus up to 24 months after account closure to handle any post-termination issues or resolve disputes.</li>
                </ul>
              </li>
              <li>
                Usage Data
                <ul className="mt-2 mb-1 list-[circle] space-y-2 pl-5 marker:text-slate-400">
                  <li>Website analytics data (cookies, IP addresses, device identifiers): up to 24 months from the date of collection, which allows us to analyze trends while respecting privacy principles.</li>
                  <li>Server logs (IP addresses, access times): up to 24 months for security monitoring and troubleshooting purposes.</li>
                </ul>
              </li>
            </ul>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Usage Data is retained in accordance with the retention periods described above, and may be retained longer only where necessary for security, fraud prevention, or legal compliance.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We may retain Personal Data beyond the periods stated above for different reasons:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li>Legal obligation: We are required by law to retain specific data (e.g., financial records for tax authorities).</li>
              <li>Legal claims: Data is necessary to establish, exercise, or defend legal claims.</li>
              <li>Your explicit request: You ask Us to retain specific information.</li>
              <li>Technical limitations: Data exists in backup systems that are scheduled for routine deletion.</li>
            </ul>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">You may request information about how long We will retain Your Personal Data by contacting Us.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">When retention periods expire, We securely delete or anonymize Personal Data according to the following procedures:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li>Deletion: Personal Data is removed from Our systems and no longer actively processed.</li>
              <li>Backup retention: Residual copies may remain in encrypted backups for a limited period consistent with Our backup retention schedule and are not restored except where necessary for security, disaster recovery, or legal compliance.</li>
              <li>Anonymization: In some cases, We convert Personal Data into anonymous statistical data that cannot be linked back to You. This anonymized data may be retained indefinitely for research and analytics.</li>
            </ul>

            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Transfer of Your Personal Data</h3>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Your information, including Personal Data, is processed at the Company&apos;s operating offices and in any other places where the parties involved in the processing are located. This means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of Your jurisdiction.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards and, where relevant, supplementary measures. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place, including the security of Your data and other personal information.</p>

            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Delete Your Personal Data</h3>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Our Service may give You the ability to delete certain information about You from within the Service.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">You may update, amend, or delete Your information at any time by signing in to Your Account, if You have one, and visiting the account settings section that allows You to manage Your personal information. You may also contact Us to request access to, correct, or delete any Personal Data that You have provided to Us.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Please note, however, that We may need to retain certain information when We have a legal obligation or lawful basis to do so.</p>

            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Disclosure of Your Personal Data</h3>
            <h4 className="mt-6 mb-2 text-[15px] font-semibold text-slate-800">Business Transactions</h4>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
            <h4 className="mt-6 mb-2 text-[15px] font-semibold text-slate-800">Law Enforcement</h4>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
            <h4 className="mt-6 mb-2 text-[15px] font-semibold text-slate-800">Other Legal Requirements</h4>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li>Comply with a legal obligation</li>
              <li>Protect and defend the rights or property of the Company</li>
              <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
              <li>Protect the personal safety of Users of the Service or the public</li>
              <li>Protect against legal liability</li>
            </ul>

            <h3 className="mt-8 mb-3 text-[17px] font-bold text-blue-950 sm:text-lg">Security of Your Personal Data</h3>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>

            <h2 className="mt-10 mb-4 border-b border-slate-200 pb-2.5 text-xl font-bold tracking-tight text-blue-950 sm:text-[1.375rem]">Children&apos;s and Minors&apos; Privacy</h2>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">The Service is not directed to, and We do not knowingly collect Personal Information from, anyone under the age of 16.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">If You are a parent or guardian and You believe Your child has provided Us with Personal Information, please contact Us. If We become aware that We have collected Personal Information from anyone under the age of 16, We will take steps to remove that information from Our servers as soon as reasonably possible.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Some countries and states set a higher age at which an individual can consent to the processing of their own Personal Information. Where We rely on consent as a legal basis and the law applicable to a User sets an age higher than 16, We may require the consent of that User&apos;s parent or guardian before We collect and use their Personal Information.</p>

            <h2 className="mt-10 mb-4 border-b border-slate-200 pb-2.5 text-xl font-bold tracking-tight text-blue-950 sm:text-[1.375rem]">Links to Other Websites</h2>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will be directed to that third party&apos;s site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.</p>

            <h2 className="mt-10 mb-4 border-b border-slate-200 pb-2.5 text-xl font-bold tracking-tight text-blue-950 sm:text-[1.375rem]">Changes to this Privacy Policy</h2>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the &quot;Last updated&quot; date at the top of this Privacy Policy.</p>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

            <h2 className="mt-10 mb-4 border-b border-slate-200 pb-2.5 text-xl font-bold tracking-tight text-blue-950 sm:text-[1.375rem]">Contact Us</h2>
            <p className="mb-4 text-[15px] leading-7 text-slate-600 sm:text-base">If You have any questions about this Privacy Policy, You can contact Us:</p>
            <ul className="mb-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-slate-600 marker:text-slate-400 sm:text-base">
              <li>By email: <a className="font-medium text-brand-green underline decoration-1 underline-offset-2 transition-colors hover:text-brand-green-dark" href="mailto:info@moneylog.com">info@moneylog.com</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
