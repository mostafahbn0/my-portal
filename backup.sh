#!/bin/bash
DATE=$(date +'%Y-%m-%d_%H-%M-%S')
BACKUP_DIR="backups"
ARCHIVE_NAME="cinema_backup_$DATE.tar.gz"

echo "⏳ جاري أخذ نسخة احتياطية من المشروع..."
tar --exclude='node_modules' --exclude='.next' --exclude='backups' -czf "$BACKUP_DIR/$ARCHIVE_NAME" .

git tag -a "backup-$DATE" -m "Automated backup $DATE" 2>/dev/null || true

echo "============================================="
echo "✅ تم إنشاء النسخة الاحتياطية بنجاح!"
echo "📁 اسم الملف: $BACKUP_DIR/$ARCHIVE_NAME"
echo "============================================="
