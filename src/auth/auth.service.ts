import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwt: JwtService,
  ) {}

  async signup(createAuthDto: CreateAuthDto) {
    const user = await this.userModel.findOne({ email: createAuthDto.email });

    if (user) {
      throw new BadRequestException('user already exists!');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    const newUser = new this.userModel({
      email: createAuthDto.email,
      password: hashedPassword,
    });

    await newUser.save();
    delete newUser.password;
    return this.signinToken(newUser._id, newUser.email);
  }

  async signin(createAuthDto: CreateAuthDto) {
    const user = await this.userModel.findOne({ email: createAuthDto.email });

    // check if the user exists
    if (!user) {
      throw new ForbiddenException('Credentials Incorrect');
    }

    //compare password
    const comparedPassword = await bcrypt.compare(
      createAuthDto.password,
      user.password,
    );
    if (!comparedPassword) {
      throw new ForbiddenException('Credentials Incorrect');
    }
    
    return this.signinToken(user._id, user.email);
  }

  async signinToken(userId: string, email: string) {
    const payload = {
      id: userId,
      email,
    };

    const jwtSecret = process.env.JWT_SECRET;

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15min',
      secret: jwtSecret,
    });

    return {
      access_token: token,
    };
  }
}
