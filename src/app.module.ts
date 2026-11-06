import { Module } from "@nestjs/common";
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from "./prisma.module.js";
import { EmailModule } from './email/email.module.js';
import { EmailVerificationModule } from "./email-verification/email-verification.module.js";
import { PasswordRecoveryModule } from './password-recovery/password-recovery.module.js';
import { PantryModule } from './pantry/pantry.module.js';
import { IngredientsModule } from './ingredients/ingredients.module.js';
import { RecipesModule } from './recipes/recipes.module.js';

@Module({
  imports: [AuthModule, PrismaModule, EmailVerificationModule, EmailModule, PasswordRecoveryModule, PantryModule, IngredientsModule, RecipesModule],
  controllers: [],
  providers: []
})


export class AppModule {}
