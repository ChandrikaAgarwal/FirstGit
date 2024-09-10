//Change the main heading 'Fruit Shop' to 'Fruit World'
const heading=document.getElementById('main-heading')
heading.textContent='Fruit World'
heading.style.color='orange'  //text color to orange

//Change background color of div with id = "header" to green color
const header=document.querySelector('#header')
header.style.backgroundColor='green'
header.style.borderBottom='4px solid orange'
header.style.textAlign="center"

//Change the font color of 'Fruits In Basket' from black to green
const fruitsinBasket=document.querySelector('#basket-heading')
fruitsinBasket.style.color='brown'
fruitsinBasket.style.textAlign="center"

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
// fruitList[2].style.backgroundColor='yellow'
for(let i=0;i<fruitList.length;i++){
    fruitList[i].style.fontWeight='bold'
    fruitList[i].style.fontStyle='italic'
    fruitList[i].style.borderRadius='5px'
    fruitList[i].style.margin='5px'
   }

const evenfruits=document.querySelectorAll('.fruit:nth-child(even)')
for(let i=0;i<evenfruits.length;i++){
    console.log(evenfruits[i])
    evenfruits[i].style.backgroundColor='brown'
    evenfruits[i].style.color='white'
    evenfruits[i].style.padding='5px'
}    

const oddfruits=document.querySelectorAll('.fruit:nth-child(odd)')
for(let i=0;i<oddfruits.length;i++){
    console.log(oddfruits[i])
    oddfruits[i].style.backgroundColor='white'
    oddfruits[i].style.color='black'
    oddfruits[i].style.padding='5px'
}    

const fruitsdiv=document.querySelector('.fruits')
fruitsdiv.style.backgroundColor='gray'
fruitsdiv.style.textAlign='center'


//Change the color of 5th "li" tag
// const lastItem=document.getElementsByTagName('li')
// lastItem[4].style.color='blue'
// lastItem[4].style.fontStyle='italic'

