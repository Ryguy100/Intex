#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d provo-mental-health.ryanhafen.org --nginx --agree-tos --email ryanjhafen@gmail.com