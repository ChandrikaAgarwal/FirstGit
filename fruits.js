//Change the main heading 'Fruit Shop' to 'Fruit World'
const heading=document.getElementById('main-heading')
heading.textContent='Fruit World'
heading.style.color='orange'  //text color to orange

//Change background color of div with id = "header" to green color
const header=document.querySelector('#header')
header.style.backgroundColor='green'
header.style.borderBottom='4px solid orange'

//Change the font color of 'Fruits In Basket' from black to green
const fruitsinBasket=document.querySelector('#basket-heading')
fruitsinBasket.style.color='green'

// Introduce a paragraph element with text "Please visit us again" inside the div with id = "thanks"
//one way :
// const thanks=document.querySelector('#thanks')
// const para=document.createElement('p')
// const paraText=document.createTextNode("Please Visit Us Again")
// para.appendChild(paraText)
// thanks.appendChild(para)

//Another way
const thanks=document.querySelector('#thanks')
thanks.innerHTML='<p>Please Visit us Again</p>'

// Make all the elements in the list have bold font and background of 3rd element yellow.
//  Make all the "li" tags italic.
const fruitList=document.querySelectorAll('.fruit')
fruitList[2].style.backgroundColor='yellow'
for(let i=0;i<fruitList.length;i++){
    fruitList[i].style.fontWeight='bold'
    fruitList[i].style.fontStyle='italic'
}

//Change the color of 5th "li" tag
const lastItem=document.getElementsByTagName('li')
lastItem[4].style.color='blue'
lastItem[4].style.fontStyle='italic'
