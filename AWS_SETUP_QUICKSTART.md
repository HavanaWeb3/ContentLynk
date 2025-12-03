# AWS S3 + CloudFront Setup - Quick Start Guide

## ⚡ Quick Setup (15-20 minutes)

### Step 1: Create S3 Bucket (5 min)

1. **Go to AWS Console** → S3
2. **Click "Create bucket"**
3. **Configure bucket**:
   - **Bucket name**: `contentlynk-videos` (must be globally unique)
   - **AWS Region**: `us-east-1` (or your preferred region)
   - **Block Public Access settings**: **UNCHECK ALL** (we need public read access)
   - Leave other settings as default
4. **Click "Create bucket"**

### Step 2: Configure Bucket Policy (2 min)

1. **Open your bucket** → **Permissions** tab
2. **Scroll to "Bucket policy"** → **Click "Edit"**
3. **Paste this policy** (replace `contentlynk-videos` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::contentlynk-videos/*"
    }
  ]
}
```

4. **Click "Save changes"**

### Step 3: Configure CORS (2 min)

1. **Still in Permissions tab** → **Scroll to "Cross-origin resource sharing (CORS)"**
2. **Click "Edit"**
3. **Paste this configuration**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://contentlynk.com", "https://www.contentlynk.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. **Click "Save changes"**

### Step 4: Create IAM User (5 min)

1. **Go to AWS Console** → **IAM** → **Users**
2. **Click "Create user"**
3. **User name**: `contentlynk-uploader`
4. **Select "Attach policies directly"**
5. **Search for and select**: `AmazonS3FullAccess`
   - *Note: For production, use a more restrictive custom policy (see below)*
6. **Click "Next"** → **Create user**
7. **Click on the user** → **Security credentials** tab
8. **Click "Create access key"**
9. **Select "Application running on AWS compute service"** → **Next**
10. **Click "Create access key"**
11. **SAVE THESE CREDENTIALS** (you won't see them again):
    - Access key ID
    - Secret access key

### Step 5: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard** → Your ContentLynk project
2. **Settings** → **Environment Variables**
3. **Add these variables**:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...  (your access key from Step 4)
AWS_SECRET_ACCESS_KEY=...  (your secret key from Step 4)
AWS_S3_BUCKET=contentlynk-videos
```

4. **Select all environments** (Production, Preview, Development)
5. **Click "Save"**
6. **Redeploy** your application

### Step 6: (Optional) Set Up CloudFront for Better Performance (5 min)

1. **Go to AWS Console** → **CloudFront**
2. **Click "Create distribution"**
3. **Origin settings**:
   - **Origin domain**: Select your S3 bucket from dropdown
   - **Origin path**: Leave empty
   - **Name**: Leave default
   - **Origin access**: Select "Public"
4. **Default cache behavior**:
   - **Viewer protocol policy**: "Redirect HTTP to HTTPS"
   - **Allowed HTTP methods**: "GET, HEAD, OPTIONS"
   - **Cache policy**: "CachingOptimized"
5. **Settings**:
   - **Price class**: "Use all edge locations (best performance)"
   - Leave other settings as default
6. **Click "Create distribution"**
7. **Wait 5-10 minutes** for deployment (status will change to "Enabled")
8. **Copy the Distribution domain name** (e.g., `d1234abcd.cloudfront.net`)
9. **Add to Vercel environment variables**:
   ```
   AWS_CLOUDFRONT_URL=https://d1234abcd.cloudfront.net
   ```
10. **Redeploy**

---

## 🔒 Better IAM Policy (Production Recommended)

Instead of `AmazonS3FullAccess`, create a custom policy:

1. **IAM** → **Policies** → **Create policy**
2. **JSON tab** → Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::contentlynk-videos",
        "arn:aws:s3:::contentlynk-videos/*"
      ]
    }
  ]
}
```

3. **Name**: `ContentLynkS3Access`
4. **Create policy**
5. **Attach to your IAM user** (remove AmazonS3FullAccess first)

---

## 🧪 Test Your Setup

### Option 1: Test with cURL

```bash
# Test upload (from your local machine)
curl -X POST http://localhost:3000/api/upload/video \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/test-video.mp4"
```

### Option 2: Test through UI

1. **Run dev server**: `npm run dev`
2. **Sign in to ContentLynk**
3. **Go to**: `http://localhost:3000/create`
4. **Replace the page** with the new enhanced create page:
   - Rename `/src/app/create/page.tsx` to `page-old.tsx`
   - Rename `/src/app/create/page-enhanced.tsx` to `page.tsx`
5. **Select "Video" content type**
6. **Upload a small video** (< 50MB for testing)
7. **Check console logs** for upload progress
8. **Verify**:
   - Video appears in S3 bucket
   - Thumbnail is generated
   - Post is created in database

### Option 3: Test S3 Upload Directly

```bash
# Test S3 credentials
aws s3 ls s3://contentlynk-videos --profile contentlynk

# Upload a test file
aws s3 cp test-video.mp4 s3://contentlynk-videos/test/ --profile contentlynk

# Verify public access
curl https://contentlynk-videos.s3.us-east-1.amazonaws.com/test/test-video.mp4
```

---

## 📊 Monitoring & Costs

### Monitor Usage

1. **S3 Console** → Your bucket → **Metrics** tab
2. **CloudWatch** → **All metrics** → **S3**
3. Set up billing alerts:
   - **Billing Dashboard** → **Budgets** → **Create budget**
   - Set alert at $50, $100, $150, $200

### Estimate Your Costs

Use the **AWS Pricing Calculator**:
- https://calculator.aws/#/

Example calculation:
- 100 videos @ 500MB each = 50GB storage = **$1.15/month**
- 5,000 views/month @ 5min avg (250MB per view) = 1.25TB transfer = **~$106/month**
- **Total: ~$107/month**

### Cost Optimization Tips

1. **Use CloudFront** - Cheaper data transfer than direct S3
2. **Enable S3 Intelligent-Tiering** - Auto-move old videos to cheaper storage
3. **Set lifecycle policies** - Delete old thumbnail versions
4. **Compress videos** - Reduce file sizes before upload
5. **Use lower quality** for preview/thumbnails

---

## 🚨 Troubleshooting

### Error: "Access Denied"
- **Check bucket policy** is correctly set
- **Check IAM user** has correct permissions
- **Check CORS** configuration includes your domain

### Error: "Bucket not found"
- **Verify bucket name** matches environment variable
- **Check AWS region** matches your bucket region

### Error: "Invalid credentials"
- **Double-check** AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- **Regenerate access key** if needed

### Video upload fails
- **Check file size** (max 2GB)
- **Check file format** (MP4, MOV, AVI, WebM)
- **Check server logs** in Vercel
- **Test with smaller file** first

### FFmpeg errors
- **Local**: Install FFmpeg (`brew install ffmpeg`)
- **Production**: FFmpeg may not be available on Vercel
  - Use external service (AWS MediaConvert, Cloudinary)
  - Or process videos client-side before upload

---

## 🔐 Security Checklist

- [ ] IAM user has minimal required permissions
- [ ] AWS credentials are in environment variables (never in code)
- [ ] S3 bucket has public read but not public write
- [ ] CORS only allows your domains
- [ ] CloudFront uses HTTPS only
- [ ] Set up AWS CloudTrail for audit logs
- [ ] Enable S3 versioning for backup
- [ ] Set up billing alerts

---

## 📞 Need Help?

- **AWS Support**: https://console.aws.amazon.com/support/
- **AWS Documentation**: https://docs.aws.amazon.com/s3/
- **CloudFront Guide**: https://docs.aws.amazon.com/cloudfront/

---

**Setup Complete!** ✅

You can now upload videos up to 2GB and they'll be automatically stored in S3 with thumbnails generated.

Next steps:
1. Test video upload with a small file
2. Monitor costs for first week
3. Set up CloudFront for better performance
4. Implement video clip creation feature
