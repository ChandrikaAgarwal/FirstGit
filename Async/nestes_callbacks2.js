function add(value, callback) {
    // complete this function
      setTimeout(() => {
          value += 3
          console.log("Added 3")
          callback(value)
    },2000)
  }
  
  
  function multiply(value, callback) {
     // complete this function
      setTimeout(() => {
          value *= 2
          console.log("Multiplied by 2")
          callback(value)
      }, 1000)
  }
  
  
  // don't change it
  const initialValue = 2;
  
  
  // create callback hell 
  add(initialValue, (newValue) => {
      multiply(newValue,(result) => {
          console.log("Final Result:",result)
      })
  });
  