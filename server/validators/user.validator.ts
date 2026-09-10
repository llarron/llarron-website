import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(2, 'Enter your name using 2-60 letters.').max(60, 'Enter your name using 2-60 letters.').regex(/^[a-zA-Z\s]+$/, 'Enter your name using 2-60 letters.'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number beginning with 6-9.'),
  interest: z.string().min(1, 'Please choose an area of interest.'),
  message: z.string().max(600, 'Keep your message within 600 characters.').optional(),
  countryCode: z.string().default('+91'),
  timezone: z.string().default('Asia/Kolkata'),
  route: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  platform: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  utm_term: z.string().optional(),
  matchtype: z.string().optional(),
  network: z.string().optional(),
  device: z.string().optional(),
  keyword: z.string().optional(),
  placement: z.string().optional(),
  campaignid: z.string().optional(),
  adgroupid: z.string().optional(),
}).transform(data => {
  // 1. Strip the country code from the start of the phone number if the user accidentally included it
  if (data.phone.startsWith(data.countryCode)) {
    data.phone = data.phone.slice(data.countryCode.length);
  }
  // 2. Strip any leftover non-numeric characters (spaces, dashes, etc)
  data.phone = data.phone.replace(/\D/g, '');
  
  return data;
});

export const UserDetailsQuerySchema = z.object({
  range: z.enum(['today', 'yesterday', '7days', '1month', 'custom']).default('today'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
}).refine(data => {
  if (data.range === 'custom') {
    return !!data.startDate && !!data.endDate;
  }
  return true;
}, {
  message: "startDate and endDate are required when range is 'custom'",
  path: ['range'],
});
