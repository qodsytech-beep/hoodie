export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">الشروط والأحكام</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">قبول الشروط</h2>
          <p className="text-neutral-700">
            باستخدام موقع TOKO، أنت توافق على الالتزام بالشروط والأحكام المذكورة هنا.
            إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الموقع.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">المنتجات والأسعار</h2>
          <ul className="space-y-3 text-neutral-700">
            <li>• نحتفظ بالحق في تغيير الأسعار في أي وقت دون إشعار مسبق</li>
            <li>• جميع المنتجات عرضة للتوفر</li>
            <li>• الصور المعروضة هي للأغراض التوضيحية فقط</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">الدفع</h2>
          <p className="text-neutral-700">
            نقبل الدفع عند الاستلام (COD) لجميع الطلبات. المبلغ المطلوب يجب دفعه عند استلام الطلب.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">الخصوصية</h2>
          <p className="text-neutral-700">
            نحن نلتزم بحماية خصوصية عملائنا. معلوماتك الشخصية محمية ولن يتم مشاركتها مع أطراف ثالثة.
          </p>
        </div>
      </div>
    </div>
  )
}

