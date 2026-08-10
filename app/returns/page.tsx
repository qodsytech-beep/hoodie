export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">سياسة الاستبدال والإرجاع</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">شروط الاستبدال والإرجاع</h2>
          <ul className="space-y-3 text-neutral-700">
            <li>• يمكنك استبدال أو إرجاع المنتج خلال 14 يوم من تاريخ الاستلام</li>
            <li>• يجب أن يكون المنتج بحالة جيدة وغير مستخدم</li>
            <li>• يجب الاحتفاظ بالفاتورة الأصلية</li>
            <li>• المنتجات المخصصة أو المستخدمة لا يمكن إرجاعها</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">طريقة الإرجاع</h2>
          <p className="text-neutral-700 mb-4">
            للاستفسار عن الإرجاع أو الاستبدال، يرجى التواصل معنا عبر:
          </p>
          <ul className="space-y-2 text-neutral-700">
            <li>• واتساب: +20 123 456 7890</li>
            <li>• البريد الإلكتروني: info@toko.com</li>
            <li>• الهاتف: +20 123 456 7890</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

