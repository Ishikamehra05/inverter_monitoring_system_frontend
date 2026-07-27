export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-10 text-white text-center">
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          <p className="mt-2 text-blue-100">
            Polycab Solar
          </p>
          <p className="mt-1 text-sm text-blue-200">
            Last Updated: July 2026
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-10 space-y-8 text-gray-700 leading-8">

          {/* Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By registering for and using the Polycab Solar Monitoring
              Application, you agree to comply with and be bound by these Terms
              & Conditions. If you do not agree with any part of these terms,
              you should not use the application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Account Registration
            </h2>
            <p>
              Users must provide accurate and complete information during
              registration. You are responsible for maintaining the
              confidentiality of your account credentials and all activities
              performed under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Solar Plant Monitoring Services
            </h2>
            <p>
              The application provides monitoring, reporting, and analytics
              related to connected solar plants, inverters, and associated
              equipment. Data displayed is based on information received from
              connected devices and communication networks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Data Collection and Usage
            </h2>
            <p>
              Polycab may collect operational data including energy generation,
              performance metrics, fault logs, equipment status, and account
              information for the purpose of providing monitoring services,
              analytics, support, and system improvements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. User Responsibilities
            </h2>
            <p>
              Users are responsible for ensuring the accuracy of information
              provided, maintaining secure access credentials, and complying
              with all applicable laws and regulations related to the operation
              of their solar installations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Service Availability
            </h2>
            <p>
              While Polycab strives to provide uninterrupted access to
              monitoring services, availability may be affected by maintenance
              activities, communication failures, internet connectivity issues,
              or third-party service disruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Intellectual Property
            </h2>
            <p>
              All content, software, trademarks, logos, and intellectual
              property associated with the Polycab Solar Monitoring Application
              remain the property of Polycab India Limited or its licensors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              Polycab shall not be liable for any indirect, incidental,
              consequential, or special damages arising from the use of the
              application, including loss of data, business interruption, or
              inaccuracies in monitoring data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Privacy
            </h2>
            <p>
              Personal information collected through the application will be
              processed in accordance with Polycab's Privacy Policy and
              applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Changes to Terms
            </h2>
            <p>
              Polycab reserves the right to update or modify these Terms &
              Conditions at any time. Continued use of the application after
              such updates constitutes acceptance of the revised terms.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t pt-8 mt-10 text-center text-sm text-gray-500">
            <p>© 2026 Polycab India Limited. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}