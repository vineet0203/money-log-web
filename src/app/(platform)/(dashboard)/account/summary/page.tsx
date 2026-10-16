import { redirect } from 'next/navigation';

export default function AccountSummaryRedirect() {
  redirect('/profile');
}
