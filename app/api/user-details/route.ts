import { NextRequest } from 'next/server';
import connectToDatabase from '@/server/config/db';
import { UserController } from '@/server/controllers/user.controller';
import { UserService } from '@/server/services/user.service';
import { UserRepository } from '@/server/repositories/user.repository';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export async function GET(req: NextRequest) {
  await connectToDatabase();
  return userController.getUserDetails(req);
}
