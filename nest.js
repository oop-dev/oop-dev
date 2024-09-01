SELECT {
    a := sum(Transaction.amount  filter Transaction.merchant.id=<uuid>'3dda3f28-6110-11ef-8073-87a9bf910a05'),
    b := sum((SELECT Transaction filter Transaction.merchant.id=<uuid>'3dda3f28-6110-11ef-8073-87a9bf910a05' and Transaction.type = 0 AND Transaction.created_at >= datetime_current() - <cal::relative_duration>'1 year').amount),
    c := sum((SELECT Transaction filter Transaction.merchant.id=<uuid>'3dda3f28-6110-11ef-8073-87a9bf910a05' and Transaction.type = 0 AND Transaction.created_at >= datetime_truncate(datetime_current(),'days')).amount)};
