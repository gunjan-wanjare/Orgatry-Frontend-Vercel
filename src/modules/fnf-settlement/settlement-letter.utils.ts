import type { FnFSettlementDetail } from '@/types/fnf-settlement';
import aYakaBrand from '@/assets/A-YAKA-Brand.jpg';
import iitilLogo from '@/assets/Iitil-logo.jpg';
import credipleLogo from '@/assets/Crediple pvt ltd.jpg';
import { formatDate } from '@/utils/timeUtils';

const IMG_A_YAKA = aYakaBrand;
const IMG_IITIL = iitilLogo;
const IMG_CREDIPLE = credipleLogo;

function toCurrency(val: unknown): string {
  const n = Number(val ?? 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);
}

export function generateSettlementLetterHtml(settlement: FnFSettlementDetail): string {
  const { employeeMaster, separation, salaryEarnings, deductions, assetsClearance, finalSettlement, caseId } = settlement;

  const fullName = String(employeeMaster?.employeeFullName ?? '');
  const firstName = fullName.split(' ')[0] ?? 'Employee';
  const empId = String(employeeMaster?.employeeId ?? '');
  const designation = String(employeeMaster?.designation ?? '');
  const department = String(employeeMaster?.department ?? '');
  const doj = formatDate(employeeMaster?.dateOfJoining, 'dd MMM yyyy');
  const doe = formatDate(employeeMaster?.dateOfExit, 'dd MMM yyyy');
  const lwd = formatDate(employeeMaster?.lastWorkingDay, 'dd MMM yyyy');
  const reportingDesignation = String(employeeMaster?.reportingDesignation ?? '-');
  const exitType = String(separation?.exitType ?? 'V | Resignation/Termination/Retirement/Mutual Separation');
  const noticePeriod = employeeMaster?.noticePeriodApplicable ? 'Yes' : 'No';
  const exitClearanceStatus = String(separation?.exitClearanceStatus ?? '-');

  const today = formatDate(new Date(), 'dd MMMM yyyy');
  const settlementReleaseDate = formatDate(finalSettlement?.settlementReleaseDate, 'dd MMM yyyy');

  const assetLabel = (asset: Record<string, unknown> | undefined, fallback: string): string => {
    if (!asset) return fallback;
    return String(asset.status ?? fallback);
  };

  const isEmailDisabled = Boolean((assetsClearance as Record<string, unknown>)?.emailAccessDisabled);

  const UTILITY_CSS = `.max-w-\\[820px\\]{max-width:820px}.mx-auto{margin-left:auto;margin-right:auto}.px-14{padding-left:56px;padding-right:56px}.py-12{padding-top:48px;padding-bottom:48px}.bg-white{background-color:#fff}.text-gray-800{color:#333}.flex{display:flex}.justify-between{justify-content:space-between}.items-center{align-items:center}.items-end{align-items:flex-end}.mb-6{margin-bottom:24px}.h-10{height:40px}.w-auto{width:auto}.border-0{border:0}.border-t{border-top:1px solid}.border-gray-300{border-color:#d1d5db}.m-0{margin:0}.mb-5{margin-bottom:20px}.underline{text-decoration:underline}.font-bold{font-weight:700}.text-sm{font-size:14px}.mb-1\\.5{margin-bottom:6px}.text-\\[12\\.5px\\]{font-size:12.5px}.mb-1{margin-bottom:4px}.my-\\[18px\\]{margin-top:18px;margin-bottom:18px}.mb-\\[10px\\]{margin-bottom:10px}.text-\\[13px\\]{font-size:13px}.my-0\\.5{margin-top:2px;margin-bottom:2px}.my-3\\.5{margin-top:14px;margin-bottom:14px}.mt-3\\.5{margin-top:14px}.leading-relaxed{line-height:1.625}.mb-2\\.5{margin-bottom:10px}.mt-6{margin-top:24px}.mb-2{margin-bottom:8px}.text-black{color:#000}.w-full{width:100%}.border-collapse{border-collapse:collapse}.px-0\\.5{padding-left:2px;padding-right:2px}.py-1{padding-top:4px;padding-bottom:4px}.align-top{vertical-align:top}.w-\\[220px\\]{width:220px}.px-1{padding-left:4px;padding-right:4px}.py-1\\.5{padding-top:6px;padding-bottom:6px}.text-right{text-align:right}.border-gray-800{border-color:#333}.w-\\[200px\\]{width:200px}.mt-9{margin-top:36px}.pt-2\\.5{padding-top:10px}.h-7{height:28px}.block{display:block}.text-\\[11px\\]{font-size:11px}.text-gray-500{color:#6b7280}.text-blue-600{color:#2563eb}.no-underline{text-decoration:none}.mt-10{margin-top:40px}.py-2{padding-top:8px;padding-bottom:8px}.border-t-2{border-top-width:2px}.border-black{border-color:#000}.text-green-700{color:#15803d}.text-xs{font-size:12px}.mt-8{margin-top:32px}.pl-\\[18px\\]{padding-left:18px}`;

  return `
<style>${UTILITY_CSS}</style>
<div class="page max-w-[820px] mx-auto px-14 py-12 bg-white text-gray-800">
  <div class="flex justify-between items-center mb-6">
    <img src="${IMG_A_YAKA}" alt="A-YAKA Brand" class="h-10 w-auto" />
    <img src="${IMG_IITIL}" alt="IITIL logo" class="h-10 w-auto" />
  </div>
  <hr class="border-0 border-t border-gray-300 m-0 mb-5" />

  <p class="underline font-bold text-sm mb-1.5">FULL &amp; FINAL SETTLEMENT LETTER</p>
  <p class="text-[12.5px] mb-1">Date: ${today}</p>
  <p class="text-[12.5px] mb-1">Ref #: ${caseId}</p>

  <div class="my-[18px] mb-[10px] text-[13px]">
    <p class="my-0.5">To,</p>
    <p class="my-0.5">Mr./Ms. <strong>${fullName}</strong></p>
    <p class="my-0.5">Employee ID: ${empId}</p>
    <p class="my-0.5">Designation: ${designation}</p>
    <p class="my-0.5">Department: ${department}</p>
  </div>

  <p class="text-[13px] my-3.5"><strong>Subject:</strong> Full &amp; Final Settlement Statement</p>
  <p class="font-bold text-[13px] mt-3.5 mb-1">Dear Mr./Ms. ${firstName},</p>
  <p class="text-[12.5px] leading-relaxed mb-2.5">This letter serves as the official Full &amp; Final Settlement Statement pertaining to your employment with IITIL following the cessation of your employment.</p>
  <p class="text-[12.5px] leading-relaxed mb-2.5">Based on the records available with the Company and upon completion of the exit formalities, clearance procedures, and verification of all recoveries, the following settlement has been computed.</p>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">1. Employee Details</h3>
  <table class="w-full border-collapse text-[12.5px] mb-1.5">
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Employee Name</td><td class="px-0.5 py-1 align-top">${fullName}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Employee ID</td><td class="px-0.5 py-1 align-top">${empId}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Designation</td><td class="px-0.5 py-1 align-top">${designation}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Department</td><td class="px-0.5 py-1 align-top">${department}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Date of Joining (DOJ)</td><td class="px-0.5 py-1 align-top">${doj}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Date of Separation (DOS)</td><td class="px-0.5 py-1 align-top">${doe}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Last Working Day (LWD)</td><td class="px-0.5 py-1 align-top">${lwd}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Reporting Designation</td><td class="px-0.5 py-1 align-top">${reportingDesignation}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Exit Type</td><td class="px-0.5 py-1 align-top">${exitType}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Notice Period Applicable</td><td class="px-0.5 py-1 align-top">${noticePeriod}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Exit Clearance Status</td><td class="px-0.5 py-1 align-top">${exitClearanceStatus}</td></tr>
  </table>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">2. Earnings Payable</h3>
  <table class="w-full border-collapse text-[12.5px] mb-1.5">
    <tr><td class="px-1 py-1.5">Salary Payable up to Last Working Day</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(salaryEarnings?.proRataSalary ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Leave Encashment</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(0)}</td></tr>
    <tr><td class="px-1 py-1.5">Incentives / Performance Pay</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(salaryEarnings?.incentivesBonusPayable ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Reimbursements Approved</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(0)}</td></tr>
    <tr><td class="px-1 py-1.5">Arrears</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(salaryEarnings?.arrears ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Other Payables</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(salaryEarnings?.otherEarnings ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5 border-t border-gray-800 font-bold">Total Earnings</td><td class="px-1 py-1.5 text-right border-t border-gray-800 font-bold">\u20B9 ${toCurrency(finalSettlement?.totalEarnings ?? 0)}</td></tr>
  </table>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">3. Deductions &amp; Recoveries</h3>
  <table class="w-full border-collapse text-[12.5px] mb-1.5">
    <tr><td class="px-1 py-1.5">Provident Fund Deduction</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(deductions?.pfEmployeeContribution ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Professional Tax</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(deductions?.professionalTax ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Income Tax (TDS)</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(deductions?.incomeTaxTds ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Notice Pay Recovery</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(deductions?.noticePayRecovery ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Salary Advance Recovery</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(deductions?.advanceSalaryRecovery ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Loan Recovery</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(deductions?.loanRecovery ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Asset Recovery Charges</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(deductions?.assetRecoveryCharges ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Other Recoveries</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(deductions?.anyOtherDeduction ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5 border-t border-gray-800 font-bold">Total Deductions</td><td class="px-1 py-1.5 text-right border-t border-gray-800 font-bold">\u20B9 ${toCurrency(finalSettlement?.totalDeductions ?? 0)}</td></tr>
  </table>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">4. Company Asset Clearance</h3>
  <p class="text-[12.5px] leading-relaxed mb-2.5">The employee confirms that all Company-owned assets, information, records, credentials, and materials have been returned to the Company.</p>
  <table class="w-full border-collapse text-[12.5px] mb-1.5">
    <tr><td class="px-0.5 py-1 font-bold w-[200px]">Asset Description</td><td class="px-0.5 py-1"><strong>Status</strong></td></tr>
    <tr><td class="px-0.5 py-1 font-bold w-[200px]">Laptop/Desktop</td><td class="px-0.5 py-1">${assetLabel((assetsClearance as Record<string, unknown>)?.laptop as Record<string, unknown> | undefined, 'Not Applicable')}</td></tr>
    <tr><td class="px-0.5 py-1 font-bold w-[200px]">Mobile Device</td><td class="px-0.5 py-1">${assetLabel((assetsClearance as Record<string, unknown>)?.mobileSim as Record<string, unknown> | undefined, 'Not Applicable')}</td></tr>
    <tr><td class="px-0.5 py-1 font-bold w-[200px]">ID Card</td><td class="px-0.5 py-1">${assetLabel((assetsClearance as Record<string, unknown>)?.idCard as Record<string, unknown> | undefined, 'Not Applicable')}</td></tr>
    <tr><td class="px-0.5 py-1 font-bold w-[200px]">Access Card</td><td class="px-0.5 py-1">${assetLabel((assetsClearance as Record<string, unknown>)?.accessCard as Record<string, unknown> | undefined, 'Not Applicable')}</td></tr>
    <tr><td class="px-0.5 py-1 font-bold w-[200px]">Email Access</td><td class="px-0.5 py-1">${isEmailDisabled ? 'Disabled' : 'Active'}</td></tr>
  </table>

  <div class="border-t border-gray-300 mt-9 pt-2.5">
    <div class="flex justify-between items-end">
      <div>
        <img src="${IMG_CREDIPLE}" alt="Crediple Pvt Ltd" class="h-7 w-auto block mb-1" />
        <span class="text-[11px] text-gray-500">Offer Letter- Page 1 of 2</span>
      </div>
      <div class="text-[11px] text-gray-500 text-right">Sattva Knowledge City, Raidurg, Hitec City,<br/>Hyderabad - 500 081, Telangana, India.<br/><a href="https://www.iitil.com" class="text-blue-600 no-underline">www.iitil.com</a></div>
    </div>
  </div>
</div>

<div class="page max-w-[820px] mx-auto mt-10 px-14 py-12 bg-white text-gray-800">

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">5. Final Settlement Summary</h3>
  <table class="w-full border-collapse text-[12.5px] mb-1.5">
    <tr><td class="px-1 py-1.5">Total Earnings</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(finalSettlement?.totalEarnings ?? 0)}</td></tr>
    <tr><td class="px-1 py-1.5">Less: Total Deductions</td><td class="px-1 py-1.5 text-right">\u20B9 ${toCurrency(finalSettlement?.totalDeductions ?? 0)}</td></tr>
    <tr><td class="px-1 py-2 border-t-2 border-black font-bold text-[13px]">Net Amount Payable to Employee</td><td class="px-1 py-2 text-right border-t-2 border-black font-bold text-[13px] text-green-700">\u20B9 ${toCurrency(finalSettlement?.netPayable ?? 0)}</td></tr>
  </table>
  <p class="text-xs text-gray-500 leading-relaxed mb-2.5">Net Amount Payable to Employee \u20B9 ${toCurrency(finalSettlement?.netPayable ?? 0)} &nbsp;|&nbsp; Net Amount Recoverable from Employee \u20B9 ${toCurrency(finalSettlement?.netRecoverable ?? 0)}</p>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">6. Payment Details</h3>
  <table class="w-full border-collapse text-[12.5px] mb-1.5">
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Payment Mode</td><td class="px-0.5 py-1 align-top">${String(finalSettlement?.paymentMode ?? 'Bank Transfer')}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Bank Name</td><td class="px-0.5 py-1 align-top">${String(finalSettlement?.bankName ?? 'XXXX Bank')}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Account Number</td><td class="px-0.5 py-1 align-top">${String(finalSettlement?.bankAccountNumber ?? '[XXXXXX]')}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Transaction Reference Number</td><td class="px-0.5 py-1 align-top">${String(finalSettlement?.paymentReferenceId ?? '[Reference No.]')}</td></tr>
    <tr><td class="px-0.5 py-1 align-top w-[220px] text-gray-800">Settlement Date</td><td class="px-0.5 py-1 align-top">${settlementReleaseDate}</td></tr>
  </table>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">7. Employee Declaration &amp; Release</h3>
  <p class="text-[12.5px] leading-relaxed mb-2.5">I, Mr./Ms. ${fullName}, hereby acknowledge that:</p>
  <ol class="text-[12.5px] leading-relaxed m-0 pl-[18px]">
    <li class="mb-1.5">I have received and reviewed the Full &amp; Final Settlement Statement issued by IITIL.</li>
    <li class="mb-1.5">I confirm that the details contained herein are true and accurate to the best of my knowledge.</li>
    <li class="mb-1.5">I acknowledge receipt of all dues payable to me by IITIL, subject to realization of funds where applicable.</li>
    <li class="mb-1.5">I confirm that I have returned all Company property, assets, confidential information, records, passwords, documents, and materials in my possession or control.</li>
    <li class="mb-1.5">I agree to maintain confidentiality regarding all business information, customer information, proprietary processes, source codes, technical information, commercial information, intellectual property, trade secrets, and other confidential information belonging to IITIL.</li>
    <li class="mb-1.5">I confirm that I shall not make any claim, demand, dispute, action, complaint, proceeding, compensation claim, or legal claim against IITIL in relation to my employment, compensation, benefits, incentives, reimbursements, statutory benefits already settled, or separation from employment, except where prohibited by applicable law.</li>
    <li class="mb-1.5">I acknowledge that this settlement constitutes a complete and final settlement of all financial dues and obligations arising out of my employment with IITIL, subject to applicable statutory provisions.</li>
    <li class="mb-1.5">I undertake to indemnify and hold harmless IITIL against any loss arising from any misrepresentation, concealment, unauthorized retention of Company assets, misuse of confidential information, or breach of post-employment obligations.</li>
    <li class="mb-1.5">I understand that any subsequent discovery of misconduct, fraud, financial irregularity, confidentiality breach, data theft, intellectual property infringement, or unauthorized retention of Company assets may entitle IITIL to pursue appropriate legal remedies notwithstanding this settlement.</li>
  </ol>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">8. Confidentiality &amp; Non-Disclosure Obligation</h3>
  <p class="text-[12.5px] leading-relaxed mb-2.5">The Employee acknowledges that all intellectual property, software, designs, databases, customer information, methodologies, business strategies, proposals, pricing information, vendor information, trade secrets, and work products created, developed, accessed, or handled during employment remain the exclusive property of IITIL.</p>
  <p class="text-[12.5px] leading-relaxed mb-2.5">The confidentiality obligations shall survive termination of employment indefinitely or for such period as permitted under applicable law.</p>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">9. Governing Law &amp; Jurisdiction</h3>
  <p class="text-[12.5px] leading-relaxed mb-2.5">This Full &amp; Final Settlement shall be governed by and construed in accordance with the laws of India and any dispute arising out of or in connection with this settlement shall be subject to the exclusive jurisdiction of the competent courts located at Hyderabad, Telangana, subject to applicable law.</p>

  <h3 class="text-[13px] font-bold underline mt-6 mb-2 text-black">10. Acceptance</h3>
  <p class="text-[12.5px] leading-relaxed mb-2.5">Kindly review the details contained in this Full &amp; Final Settlement Letter and acknowledge your acceptance by replying with &ldquo;I Accept&rdquo; through IITIL's official systems or your registered email ID. Such acceptance shall confirm your agreement to the settlement calculations, adjustments, and amounts specified herein and shall constitute full and binding consent. This letter is electronically generated, and any acceptance provided through authorized digital platforms, workflows, or email shall have the same legal validity and enforceability as a physically signed document in accordance with the Information Technology Act, 2000, and applicable laws of India. Upon completion of the settlement, the employment relationship between you and IITIL shall stand formally concluded, subject to any continuing obligations relating to confidentiality, intellectual property, and other surviving provisions under applicable agreements, company policies, or law.</p>

  <div class="mt-8 text-[13px]">
    <p class="my-0.5">Issued By</p>
    <p class="my-0.5"><strong>Team Human Resources @ IITIL</strong></p>
  </div>

  <div class="border-t border-gray-300 mt-9 pt-2.5">
    <div class="flex justify-between items-end">
      <span class="text-[11px] text-gray-500">Offer Letter- Page 2 of 2</span>
      <div class="text-[11px] text-gray-500 text-right">Sattva Knowledge City, Raidurg, Hitec City,<br/>Hyderabad - 500 081, Telangana, India.<br/><a href="https://www.iitil.com" class="text-blue-600 no-underline">www.iitil.com</a></div>
    </div>
  </div>
</div>`;
}
