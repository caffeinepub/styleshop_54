export default function DeliveryStrip() {
  return (
    <div
      className="w-full bg-black text-white overflow-hidden"
      style={{ height: "38px", display: "flex", alignItems: "center" }}
    >
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: "marquee 22s linear infinite",
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        🚚 We deliver all over India! Free delivery on all orders. 5–8 days
        delivery.&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;🚚 We deliver all over
        India! Free delivery on all orders. 5–8 days
        delivery.&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;🚚 We deliver all over
        India! Free delivery on all orders. 5–8 days
        delivery.&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;🚚 We deliver all over
        India! Free delivery on all orders. 5–8 days delivery.
      </div>
    </div>
  );
}
