# Libraries
from os import path, remove, listdir
from PIL import Image   # pip install Pillow

# constants
PATH_WA = "../../apps/"                                                     # path before editors
PATH_HELP = "/main/resources/help/images/"                                  # path after editor directory
NAME_CSS = "sprite.css"
pathEditors = ["documenteditor", "presentationeditor", "spreadsheeteditor"]     # names of editor directories

# sprites names
cssClassNames = ["big","icon", "smb"]
# directories names
spriteDirNames = ["src/big", "src/icons", "src/symbols"]

# Class for image
class ImgClass:
    _x=0
    _y=0  
    
    def __init__(self, adr):
        self._imgFile = Image.open(adr)
        self._imgName = path.splitext(path.basename(adr))[0]
        
    def get_width(self):
        return self._imgFile.size[0]

    def get_height(self):
        return self._imgFile.size[1]

    def get_nameImage(self):
        return self._imgName
    
    def get_image(self):
        return self._imgFile

    #operators definition
    # operator '<'
    def __lt__(self, other):
        if(self.get_height() == other.get_height()):
            return self.get_width() < other.get_width()
        else:
            return self.get_height() < other.get_height()

    # operator '>'
    def __gt__(self, other):
        if(self.get_height() == other.get_height()):
            return self.get_width() > other.get_width()
        else:
            return self.get_height() > other.get_height()

    # operator '!='
    def __ne__(self, other):
        return (self.get_height() != other.get_height() or self.get_width() != other.get_width())

    # operator '=='
    def __eq__(self, other):
        return (self.get_height() == other.get_height() and self.get_width() == other.get_width())
   
# class fit
# _down :Fit is bottom cell
# _right :Fit is right cell
class Fit:
    def __init__(self, x, y, w: int, h: int):
        # true if the rectangle has a image
        self.used = False

        # Rectangle for cell for image
        self.x = x
        self.y = y
        self.width = w
        self.height = h

    def set_down(self, fdown):
        self._down = fdown
    
    def get_down(self):
        return self._down

    def set_right(self, fright):
        self._right = fright

    def get_right(self):
        return self._right
    
    def __str__(self):
        strFit = "used:" + str(self.used) +"\n"
        strFit += "x:" + str(self.x) +"\n"
        strFit += "y:" + str(self.y) +"\n"
        strFit += "width:" + str(self.width) +"\n"
        strFit += "height:" + str(self.height) +"\n"
        return strFit
    
#Image with fit
class Block(ImgClass):

    def __init__(self, adr):
        super().__init__(adr)
    
    def get_x(self):
        return self._x

    def get_y(self):
        return self._y

    def set_x(self, val):
        self._x = val

    def set_y(self, val):
        self._y = val
    
    def set_fit(self, fit):
        self.fit = fit
        self.set_x(fit.x)
        self.set_y(fit.y)

#binary-tree
class GrowingPacker:
    def __init__(self, imgAdrArr):
        self.blocks =[]
        for adr in imgAdrArr:
            self.blocks.append(Block(adr))
        self.blocks.sort(reverse=True)

    # create tree
    def fit(self):
        self.ln = len(self.blocks)
        if(self.ln > 0):
            w, h = self.blocks[0].get_width(), self.blocks[0].get_height() 
        else:
            w, h = (0, 0)

        # start rectangle for general cell
        self.root = Fit(0, 0, w, h)
        
        for n in range(self.ln):
            node = self.findNode(self.root, self.blocks[n].get_width(), self.blocks[n].get_height())
            if (node != None):
                self.blocks[n].set_fit(self.splitNode(node, self.blocks[n].get_width(), self.blocks[n].get_height()))
            else:
                self.blocks[n].set_fit(self.growNode(self.blocks[n].get_width(), self.blocks[n].get_height()))
    
    def findNode(self, rootN, w, h):
        if (rootN.used):
            node = self.findNode(rootN.get_right(), w, h)
            if (node != None):
                return   node 
            else:
                return self.findNode(rootN.get_down(), w, h)
        elif (w <= rootN.width and h <= rootN.height):
            return rootN
        else:
            return None
    
    def splitNode(self, node, w, h):
        node.used = True
        node.set_down(Fit(node.x, node.y + h, node.width, node.height - h))
        node.set_right(Fit(node.x + w, node.y, node.width - w, h))
        return node
    
    def growNode(self, w, h):
        canGrowDown = (w <= self.root.width)
        canGrowRight = (h <= self.root.height)
        
        shouldGrowRight = (canGrowRight and self.root.height >= self.root.width + w)
        shouldGrowDown = (canGrowDown and self.root.width >= self.root.height + h)
              
        
        if (shouldGrowRight):
            return self.growRight(w, h)
        elif (shouldGrowDown):
            return self.growDown(w, h)
        elif (canGrowRight):
            return self.growRight(w, h)
        elif (canGrowDown):
            return self.growDown(w, h)
        else:
            return None
        
    def growRight (self, w, h):
        rootN =self.root
        
        self.root =  Fit(0, 0, rootN.width + w, rootN.height)
        self.root.used = True
        self.root.set_down(rootN)
        self.root.set_right (Fit(rootN.width, 0,  w, rootN.height))        
        node = self.findNode(self.root, w, h)        
        if (node != None ):
            return self.splitNode(node, w, h)
        else:
            return None

    def growDown (self, w, h):
        rootN = self.root
        
        self.root = Fit(0, 0, rootN.width, rootN.height + h)
        self.root.used = True
        self.root.set_down( Fit(0, rootN.height, rootN.width, h))
        self.root.set_right (rootN)

        node = self.findNode(self.root, w, h)
        if (node != None):
            return self.splitNode(node, w, h)
        else:
            return None
        
# create sprite
def createSprite (dirName, adrSprite, cssClassName):
    imgAdrArr = listdir(adrDir+dirName)
    for i in range(len(imgAdrArr)):
        imgAdrArr[i] = adrDir+dirName +"/" + imgAdrArr[i]
    gp = GrowingPacker(imgAdrArr)
    gp.fit()
    spriteFile = open(adrSprite,'a')
    img = Image.new("RGBA", (gp.root.width, gp.root.height), (0,0,0,0))
    
    strCSS = "." + cssClassName +"{\nbackground-image: url(../images/" + dirName + ".png);\n"
    strCSS += "\tbackground-repeat: no-repeat;\n\tdisplay: inline-block;\n}\n\n"
    
    spriteFile.write(strCSS)  
    for i in range(len(gp.blocks)):
        img.paste(gp.blocks[i].get_image(), (gp.blocks[i].get_x(), gp.blocks[i].get_y()))
        strCSS = "." + cssClassName +"-"+ gp.blocks[i].get_nameImage() + " {\n"
        strCSS += "\tbackground-position: "+ str(-gp.blocks[i].get_x())+"px "+ str(-gp.blocks[i].get_y())+"px;\n"
        strCSS += "\twidth: "+ str(gp.blocks[i].get_width())+"px;\n\theight: "+ str(gp.blocks[i].get_height())+"px;\n}\n\n"
        spriteFile.write(strCSS)
    spriteFile.close()
    img.save(adrDir + dirName +".png",'PNG')
        

#crreate all sprites
for index_editor in range(len(pathEditors)):
    adrDir = PATH_WA + pathEditors[index_editor] + PATH_HELP
    if(path.exists(adrDir + NAME_CSS)):
        remove(adrDir + NAME_CSS)
    for index_spr in range(len(spriteDirNames)):
        createSprite(spriteDirNames[index_spr], adrDir + NAME_CSS, cssClassNames[index_spr])












