import cashfree from "./utils";

const pay = (paymentSessionId) => {
  let checkoutOptions = {
    paymentSessionId: paymentSessionId,
    returnUrl: "https://skill-share-deepanshu-tanejas-projects.vercel.app/orders", // Update with your return URL
    notifyUrl: "https://skill-share-deepanshu-tanejas-projects.vercel.app/webhook" // Webhook endpoint
  };

  return cashfree.checkout(checkoutOptions)
    .then(function(result){
      console.log('Cashfree checkout result:', result); // Log the result
      if(result.error){
        alert(result.error.message);
        console.error('Error:', result.error);
      }
      if(result.redirect){
        console.log("Redirection URL:", result.redirect.url); // Log redirection URL
      }
      return result; // Return the result from Cashfree checkout
    })
    .catch(function(error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again later.');
      throw error; // Propagate the error further
    });
};

export default pay;
