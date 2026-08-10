export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">تواصل معنا</h1>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">معلومات التواصل</h3>
            <div className="space-y-3 text-neutral-700">
              <p>
                <strong>الهاتف:</strong> +20 123 456 7890
              </p>
              <p>
                <strong>البريد الإلكتروني:</strong> info@toko.com
              </p>
              <p>
                <strong>واتساب:</strong> +20 123 456 7890
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">ساعات العمل</h3>
            <p className="text-neutral-700">
              من السبت إلى الخميس: 9 صباحاً - 10 مساءً<br />
              الجمعة: 2 ظهراً - 10 مساءً
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

