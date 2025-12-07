#!/usr/bin/env tsx
/**
 * Script to create admin and demo user credentials in Supabase
 * Usage: tsx scripts/create-admin-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

// Simple .env loader (if .env file exists)
function loadEnv() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envPath = join(__dirname, '../.env');
    
    if (existsSync(envPath)) {
      const envFile = readFileSync(envPath, 'utf-8');
      
      envFile.split('\n').forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const match = trimmedLine.match(/^([^=:#]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
      console.log('✅ Loaded environment variables from .env file');
    }
  } catch (error) {
    // .env file not found or error reading, use environment variables directly
    console.log('ℹ️  Using environment variables from system...');
  }
}

// Load environment variables
loadEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface UserCreds {
  email: string;
  password: string;
  role: 'admin' | 'buyer' | 'supplier';
  companyName?: string;
}

const users: UserCreds[] = [
  {
    email: 'admin@lithiumlux.com',
    password: 'Admin123!@#',
    role: 'admin',
    companyName: 'Lithium & Lux Admin',
  },
  {
    email: 'demo@lithiumlux.com',
    password: 'Demo123!@#',
    role: 'buyer',
    companyName: 'Demo Company',
  },
];

async function createUser(creds: UserCreds) {
  try {
    console.log(`\n📧 Creating user: ${creds.email} (${creds.role})...`);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find((u) => u.email === creds.email);

    let userId: string;

    if (existingUser) {
      console.log(`   ⚠️  User already exists, updating...`);
      userId = existingUser.id;

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: creds.password,
        email: creds.email,
      });

      if (updateError) {
        throw updateError;
      }
      console.log(`   ✅ Password updated`);
    } else {
      // Create new user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: creds.email,
        password: creds.password,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      userId = authData.user.id;
      console.log(`   ✅ User created with ID: ${userId}`);
    }

    // Create or update user profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          role: creds.role,
          company_name: creds.companyName || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }
      console.log(`   ✅ Profile updated with role: ${creds.role}`);
    } else {
      // Create new profile
      const { error: insertError } = await supabase.from('user_profiles').insert({
        user_id: userId,
        role: creds.role,
        company_name: creds.companyName || null,
        preferences: {},
      });

      if (insertError) {
        throw insertError;
      }
      console.log(`   ✅ Profile created with role: ${creds.role}`);
    }

    return { success: true, email: creds.email, role: creds.role };
  } catch (error: any) {
    console.error(`   ❌ Error creating user ${creds.email}:`, error.message);
    return { success: false, email: creds.email, error: error.message };
  }
}

async function main() {
  console.log('🚀 Creating admin and demo users in Supabase...\n');
  console.log('📋 Credentials to be created:');
  users.forEach((user) => {
    console.log(`   • ${user.email} (${user.role}) - Password: ${user.password}`);
  });

  const results = [];

  for (const user of users) {
    const result = await createUser(user);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length > 0) {
    console.log('\n✅ Successfully created/updated users:');
    successful.forEach((r) => {
      console.log(`   • ${r.email} (${r.role})`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed to create users:');
    failed.forEach((r) => {
      console.log(`   • ${r.email}: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔑 Login Credentials:');
  console.log('='.repeat(60));
  users.forEach((user) => {
    console.log(`\n📧 ${user.email} (${user.role.toUpperCase()})`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Login at: /login`);
  });
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

