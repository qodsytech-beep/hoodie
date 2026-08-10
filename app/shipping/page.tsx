export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">الشحن والتوصيل</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">معلومات الشحن</h2>
          <ul className="space-y-3 text-neutral-700">
            <li>• مدة التوصيل: 2-5 أيام عمل</li>
            <li>• الشحن مجاني للطلبات فوق 500 جنيه</li>
            <li>• رسوم الشحن: 30 جنيه للطلبات تحت 500 جنيه</li>
            <li>• التوصيل متاح لجميع محافظات مصر</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">طريقة التوصيل</h2>
          <p className="text-neutral-700">
            نستخدم شركات الشحن الموثوقة لضمان وصول طلبك بأمان وفي الوقت المحدد.
            سيتم إرسال رقم تتبع الطلب برسالة نصية بعد تأكيد الطلب.
          </p>
        </div>
      </div>
    </div>
  )
}

