arr=[[1,1,0],[1,0,1],[0,0,0]]

for i in range(len(arr)):
    l,r=0,len(arr[i])-1
    for j in range(len(arr[i])):
        while l<r:
            temp=arr[i][l]
            arr[i][l]=arr[i][r]
            arr[i][r]=temp
            l+=1
            r-=1
print(arr)

#invert
for k in range(len(arr)):
    for l in range(len(arr[k])):
        if arr[k][l]==0:
            arr[k][l]=1
        else:
            arr[k][l]=0
print("inverted ",arr)