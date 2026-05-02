import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpJwtAuthGuard } from '../common/guards/http-jwt-auth.guard';
import { HttpAdminGuard } from '../common/guards/http-admin.guard';

@Controller('upload')
export class UploadController {
  @Post('logo')
  @UseGuards(HttpJwtAuthGuard, HttpAdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'logo-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files allowed'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadLogo(@UploadedFile() file: { filename: string; mimetype: string; size: number }) {
    if (!file) throw new BadRequestException('No file uploaded');
    return { url: `/uploads/logos/${file.filename}` };
  }
}
