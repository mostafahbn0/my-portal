#!/bin/bash
echo "📦 قائمة النسخ الاحتياطية المتاحة:"
ls -lh backups/*.tar.gz 2>/dev/null || echo "لا توجد نسخ متاحة"
echo "---------------------------------------------"
echo "لاسترجاع نسخة معينة، اكتب مسارها وفك الضغط كالتالي:"
echo "tar -xzf backups/cinema_backup_XXXX.tar.gz"
echo "أو للرجوع لآخر حفظ على Git اكتب: git reset --hard"
