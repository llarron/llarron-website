import { NextRequest } from 'next/server';
import connectToDatabase from '@/server/config/db';
import { UserController } from '@/server/controllers/user.controller';
import { UserService } from '@/server/services/user.service';
import { UserRepository } from '@/server/repositories/user.repository';
import { sendError } from '@/server/utils/response';
import { ERROR_CODES, HTTP_STATUS } from '@/server/config/constants';
import { logger } from '@/server/utils/logger';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    logger.error({ event: 'DB_CONNECTION_ERROR', errorCode: err?.code || 'UNKNOWN' }, 'Database connection failed');
    return sendError(
      'Something went wrong while submitting your enquiry. Please try again later.',
      ERROR_CODES.DATABASE_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
  return userController.signup(req);
}
