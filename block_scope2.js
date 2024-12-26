const a=100
{
    const a =20;
    {
        const a=10;
        console.log(a); //this will access the nearest a present which is 10; 
        // if we dont have a here then it will print 20;
    }
    console.log(a) //prints 20
}