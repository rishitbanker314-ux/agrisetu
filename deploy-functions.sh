#!/bin/bash

# Ensure the user has linked their Supabase project
# supabase link --project-ref <your-project-id>

echo "Deploying Fusion Engine..."
npx supabase functions deploy fusion-engine --no-verify-jwt

echo "Deploying Advisory Engine..."
npx supabase functions deploy advisory-engine --no-verify-jwt

echo "Deploying Diagnostic Module..."
npx supabase functions deploy diagnostic-module --no-verify-jwt

echo "Functions deployed successfully!"
echo ""
echo "IMPORTANT: Don't forget to set your secrets in the Supabase Dashboard or via CLI:"
echo "npx supabase secrets set GEMINI_API_KEY=your_actual_api_key_here"
