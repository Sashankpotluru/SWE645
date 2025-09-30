# SWE645 – AWS Deployment (S3 + EC2)
Author: Sri Sashank Potluru

This guide walks you through on how my website works. The detailed instructions are written on how I created the s3 bucket and EC2 instance (linex).
About the website : 
This is a small static site for SWE645 hw1 . It includes:
- `index.html` (homepage, W3.CSS + gold theme)
- `survey.html` (all required fields + client-side validation)
- `error.html` (simple error page)
- `style.css` (all custom styles)
- `validate.js` (raffle + form checks)
- `assets/me.jpg` 

You can host it on **EC2 (Nginx)** and/or **S3 (static website)**. Below are the exact steps and commands I used, with your real values filled in so you can copy/paste.


## Prereqs
- AWS account with access to S3 and EC2.
- **AWS CLI v2** installed and configured: `aws configure` (provide Access Key, Secret, region, and default output).
 - `index.html`, `survey.html`, `error.html`, `style.css`, `validate.js`, and the `assets/me.jpg` folder.

---
## Part A – S3 Static Website (optional second URL)
### Console steps
1) **Create bucket**  
   S3 → Create bucket → unique name (e.g., `swe645-sri-gmu-site`) → pick a region → Create.

2) **Allow public web hosting**  
   Bucket → Permissions → *Block public access* → **Edit** → uncheck **Block all public access** → Save.

3) **Bucket policy**   
   Bucket → Permissions → Bucket policy → paste this:
 ```json
   {{
     "Version": "2012-10-17",
     "Statement": [{{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::swe645-sri-gmu/*"
     }}]
   }}
   ```

4) **Enable static website hosting**  
   Bucket → Properties → **Static website hosting** → Enable  
   Index: `index.html`  
   Error: `error.html`  
   Save, then copy the **Website endpoint**.

5) **Upload files** (Objects → Upload)  
   Add files: `index.html`, `survey.html`, `error.html`, `style.css`, `validate.js`  
   Add folder: `assets/` (must contain `me.jpg`)

6) Open the **Website endpoint** and test.


## Part B – EC2 + Nginx (the one I used):

**Instance:** Amazon Linux 2023, `t2.micro`  
**Public DNS:** `ec2-54-172-247-197.compute-1.amazonaws.com`  
**Security Group (Inbound):**
- HTTP **80** → `0.0.0.0/0`  (required for public access)
- SSH **22** → **My IP**      (safer than Anywhere)
- (Optional) HTTPS **443** → `0.0.0.0/0` (unused until you add TLS)

I am using a mac ssh terminal for the below commands : 

### 0) One-time: fix key permissions (on your Mac)
    chmod 400 "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem"

### 1) Create a staging folder on the server
When you connect the first time, type `yes` at the authenticity prompt.
    ssh -i "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem" \
      ec2-user@ec2-54-172-247-197.compute-1.amazonaws.com \
      'mkdir -p ~/site'

### 2) Install and start Nginx
    ssh -i "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem" \
      ec2-user@ec2-54-172-247-197.compute-1.amazonaws.com \
      'sudo dnf update -y && sudo dnf install -y nginx && sudo systemctl enable --now nginx && sudo systemctl status nginx --no-pager | head -n 10'

### 3) Upload the website from your Mac
Pick **one** of these:
**One command (puts `-r` before sources):**
    scp -i "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem" -r \
      index.html survey.html error.html style.css validate.js assets \
      ec2-user@ec2-54-172-247-197.compute-1.amazonaws.com:~/site/

**OR two commands (files then folder):**
    scp -i "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem" \
      index.html survey.html error.html style.css validate.js \
      ec2-user@ec2-54-172-247-197.compute-1.amazonaws.com:~/site/

    scp -i "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem" -r \
      assets \
      ec2-user@ec2-54-172-247-197.compute-1.amazonaws.com:~/site/

### 4) Move the site into Nginx’s web root and restart
    ssh -i "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem" \
      ec2-user@ec2-54-172-247-197.compute-1.amazonaws.com \
      'sudo rm -rf /usr/share/nginx/html/* && sudo mv ~/site/* /usr/share/nginx/html/ && sudo chown -R nginx:nginx /usr/share/nginx/html && sudo systemctl restart nginx && ls -la /usr/share/nginx/html'
The Mac shoulkd display this when it succesffuly run the command : 
You should see:
    index.html
    survey.html
    error.html
    style.css
    validate.js
    assets/your-photo.jpg

### 5) Quick checks (on the server)
Open an SSH shell, then:
    sudo ss -tulpen | grep ':80'   # nginx should be listening on :80
    curl -I localhost              # should return HTTP/1.1 200 OK with Server: nginx

### 6) Test in your browser
    http://ec2-54-172-247-197.compute-1.amazonaws.com/
    http://ec2-54-172-247-197.compute-1.amazonaws.com/survey.html

### (Optional) Add/replace your photo after deploy
Upload from Mac:
    scp -i "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem" \
      "/Users/srisashankpotluru/Downloads/my-photo.jpg" \
      ec2-user@ec2-54-172-247-197.compute-1.amazonaws.com:~/your-photo.jpg

Move it into place on EC2:
    ssh -i "/Users/srisashankpotluru/Desktop/swe645-sri-gmu.pem" \
      ec2-user@ec2-54-172-247-197.compute-1.amazonaws.com \
      'sudo mv ~/your-photo.jpg /usr/share/nginx/html/assets/your-photo.jpg && sudo chown nginx:nginx /usr/share/nginx/html/assets/me.jpg'

---


