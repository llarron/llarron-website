import User, { IUser } from '@/server/models/User';
import UtmCampaign from '@/server/models/UtmCampaign';
import Consultation from '@/server/models/Consultation';

import mongoose from 'mongoose';

export class UserRepository {
  async findByEmailAndPhone(email: string | undefined, phone: string): Promise<{
    byEmail: IUser | null;
    byPhone: IUser | null;
  }> {
    const [byEmail, byPhone] = await Promise.all([
      email ? User.findOne({ email }) : Promise.resolve(null),
      User.findOne({ phone }),
    ]);
    return { byEmail, byPhone };
  }

  async createUser(
    userData: Partial<IUser>,
    campaignData: Record<string, unknown>,
    consultationData: Record<string, unknown>
  ): Promise<IUser> {
    const session = await mongoose.startSession();

    try {
      let createdUser: IUser | null = null;

      await session.withTransaction(async () => {
        // Sequential checks inside transaction to avoid race conditions and parallel session ops
        if (userData.email) {
          const existingByEmail = await User.findOne({ email: userData.email }).session(session);
          if (existingByEmail) {
            throw new Error('USER_ALREADY_EXISTS');
          }
        }

        if (userData.phone) {
          const existingByPhone = await User.findOne({ phone: userData.phone }).session(session);
          if (existingByPhone) {
            throw new Error('USER_ALREADY_EXISTS');
          }
        }

        // Sequential document writes inside transaction
        const [user] = await User.create([userData], { session });
        createdUser = user;

        if (Object.keys(campaignData).length > 0) {
          await UtmCampaign.create([{ userId: user._id, ...campaignData }], { session });
        }

        if (Object.keys(consultationData).length > 0) {
          await Consultation.create([{ userId: user._id, ...consultationData }], { session });
        }
      });

      if (!createdUser) {
        throw new Error('USER_CREATION_FAILED');
      }

      return createdUser;
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err?.code === 11000 || err?.message === 'USER_ALREADY_EXISTS') {
        throw new Error('USER_ALREADY_EXISTS');
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateExistingUser(
    userId: mongoose.Types.ObjectId,
    userData: Partial<IUser>,
    campaignData: Record<string, unknown>,
    consultationData: Record<string, unknown>
  ): Promise<boolean> {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Sequential update inside transaction
        if (userData) {
          await User.findByIdAndUpdate(
            userId,
            {
              $set: {
                name: userData.name,
                countryCode: userData.countryCode,
                timezone: userData.timezone,
              },
            },
            { session }
          );
        }

        if (Object.keys(campaignData).length > 0) {
          await UtmCampaign.create([{ userId, ...campaignData }], { session });
        }

        if (Object.keys(consultationData).length > 0) {
          await Consultation.create([{ userId, ...consultationData }], { session });
        }
      });

      return true;
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err?.code === 11000 || err?.message === 'USER_ALREADY_EXISTS') {
        throw new Error('USER_ALREADY_EXISTS');
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
