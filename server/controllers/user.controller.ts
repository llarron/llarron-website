import { UserService } from '@/server/services/user.service';
import { sendSuccess, sendError } from '@/server/utils/response';
import { SignupSchema, UserDetailsQuerySchema } from '@/server/validators/user.validator';
import { HTTP_STATUS, ERROR_CODES } from '@/server/config/constants';
import { NextRequest } from 'next/server';
import { logger } from '@/server/utils/logger';

export class UserController {
  constructor(private service: UserService) {}

  async signup(req: NextRequest) {
    try {
      const body = await req.json();
      const validationResult = SignupSchema.safeParse(body);

      if (!validationResult.success) {
        logger.warn({ errors: validationResult.error.format() }, 'Signup validation failed');
        return sendError('Please check your details and try again. Some information seems to be missing or incorrect.', ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, validationResult.error.format());
      }

      const clientIp = req.headers.get('x-forwarded-for') || req.ip || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      const result = await this.service.registerUser(validationResult.data, clientIp, userAgent);

      return sendSuccess(result, 'Your information has been successfully saved. Thank you!', result.status === 'new' ? HTTP_STATUS.CREATED : HTTP_STATUS.OK);
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        logger.warn('Malformed JSON payload in signup request');
        return sendError('We received an invalid request format. Please try submitting again.', ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
      }
      if (error.message === 'USER_ALREADY_EXISTS') {
        logger.warn('User already exists with this email or phone');
        return sendError('It looks like you already have an account with this email or phone number.', ERROR_CODES.USER_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
      }
      logger.error(error, 'Error during signup');
      return sendError(error.message || 'Oops! Something went wrong on our end. Please try again later.', ERROR_CODES.UNKNOWN_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserDetails(req: NextRequest) {
    try {
      const searchParams = req.nextUrl.searchParams;
      const query = Object.fromEntries(searchParams.entries());
      
      const validationResult = UserDetailsQuerySchema.safeParse(query);

      if (!validationResult.success) {
         logger.warn({ errors: validationResult.error.format() }, 'User details validation failed');
         return sendError('Please check the selected date range and try again.', ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, validationResult.error.format());
      }

      const result = await this.service.getUserDetails(validationResult.data);
      return sendSuccess(result, 'User details loaded successfully.');
    } catch (error: any) {
      logger.error(error, 'Error fetching user details');
      return sendError(error.message || 'Oops! Something went wrong while loading the data. Please try again later.', ERROR_CODES.UNKNOWN_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
