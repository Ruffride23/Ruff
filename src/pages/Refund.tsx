export default function Refund() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-yellow-500">Refund Policy</h1>
      <div className="space-y-6 text-white/80 leading-relaxed">
        <p>This Refund Policy outlines the terms under which refunds may be issued for ticket purchases on TicketLux.</p>
        
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. General Policy</h2>
        <p>All ticket purchases are final and non-refundable. By purchasing a ticket, you agree that you are entering a competition and there is no guarantee of winning a prize.</p>
        
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Exceptions</h2>
        <p>Refunds may be issued in the following exceptional circumstances:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>If a raffle is cancelled by TicketLux before the draw takes place.</li>
          <li>If there is a technical error on our website that results in you being charged multiple times for the same ticket.</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Requesting a Refund</h2>
        <p>If you believe you are eligible for a refund under one of the exceptions listed above, please contact our support team within 14 days of the purchase date. Please provide your order number and a detailed explanation of the issue.</p>
        
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Processing Time</h2>
        <p>Approved refunds will be processed within 5-10 business days and credited back to the original payment method used for the purchase.</p>
      </div>
    </div>
  );
}
