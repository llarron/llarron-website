import { UserRepository } from '@/server/repositories/user.repository';
import { SignupSchema } from '@/server/validators/user.validator';
import { z } from 'zod';
import { logger } from '@/server/utils/logger';
import mongoose from 'mongoose';

export class UserService {
  constructor(private repository: UserRepository) {}

  async registerUser(data: z.infer<typeof SignupSchema>, clientIp?: string, userAgent?: string) {
    const { byEmail, byPhone } = await this.repository.findByEmailAndPhone(data.email, data.phone);

    // Split match conflict detection: submitted email and phone belong to two different users
    if (byEmail && byPhone && byEmail._id.toString() !== byPhone._id.toString()) {
      logger.warn({ event: 'USER_CONFLICT' }, 'User details conflict with existing accounts');
      throw new Error('USER_CONFLICT');
    }

    const campaignData = {
      route: data.route,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      platform: data.platform,
      gclid: data.gclid,
      fbclid: data.fbclid,
      fbp: data.fbp,
      fbc: data.fbc,
      utm_term: data.utm_term,
      matchtype: data.matchtype,
      network: data.network,
      device: data.device,
      keyword: data.keyword,
      placement: data.placement,
      campaignid: data.campaignid,
      adgroupid: data.adgroupid,
      clientIp,
      userAgent,
    };

    const consultationData = {
      interest: data.interest,
      message: data.message,
    };

    const userData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      countryCode: data.countryCode,
      timezone: data.timezone,
    };

    const existingUser = byEmail || byPhone;

    if (existingUser) {
      // Multi-Touchpoint Tracking: add new campaign and update demographics
      logger.info({ event: 'EXISTING_USER_TOUCHPOINT' }, 'Existing user touchpoint recorded');
      await this.repository.updateExistingUser(
        existingUser._id as mongoose.Types.ObjectId,
        userData,
        campaignData,
        consultationData
      );
      
      // Return updated demographics for response
      const updatedUser = { ...existingUser.toObject(), name: userData.name, interest: consultationData.interest, message: consultationData.message };
      return { user: updatedUser, status: 'existing' };
    }

    logger.info({ event: 'NEW_USER_CREATED' }, 'New user record created');
    const newUser = await this.repository.createUser(userData, campaignData, consultationData);
    return { user: newUser, status: 'new' };
  }
}
