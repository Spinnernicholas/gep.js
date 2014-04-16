gep = {};
gep.terminals = ["a","b"];
gep.baseFunctions = [];
gep.baseFunctionDefs = {};

gep.getTerminalIndex = function(ch)
{
  return this.terminals.indexOf(ch);
}

gep.addFunction = function(ch, func){
  this.baseFunctions.push(ch);
  this.baseFunctionDefs[ch] = func;
}

gep.executeBaseFunction = function(ch,args)
{
  return this.baseFunctionDefs[ch].apply(null, args);
}

gep.calcChildrenRowSize = function(row){
  var size = 0;
  for(var i=0;i<row.length;i++)
  {
    if(this.baseFunctions.indexOf(row[i]) >= 0)
    {
      size += this.baseFunctionDefs[row[i]].length;
    }
  }
  return size;
}

gep.getNumberOfArgs = function(ch)
{
  if(this.baseFunctions.indexOf(ch[0]) >= 0)
  {
    return this.baseFunctionDefs[ch[0]].length;
  }
  else
  {
    return 0;
  }
}

/************\
**** Node ****
\************/

gep.Node = function(ch){
  this.ch = ch[0];
  this.children = [];
  this.value = 0;
  if(gep.getTerminalIndex(this.ch) >= 0)
  {
    this.terminal = true;
  }
  else
  {
    this.terminal = false;
  }
}

gep.Node.prototype.createChildren = function(rows, row){
  for(var i=0;i<gep.getNumberOfArgs(this.ch);i++,rows[row]=rows[row].substring(1))
  {
    this.children.push(new gep.Node(rows[row]));
  }
  for(var i=0;i<this.children.length;i++)
  {
    this.children[i].createChildren(rows, row+1);
  }
}

gep.Node.prototype.Execute = function(){
  if(this.terminal)
  {
    this.value = arguments[gep.getTerminalIndex(this.ch)];
  }
  else
  {
    var args = [];
    for(var i = 0;i<this.children.length;i++)
    {
      args.push(this.children[i].Execute.apply(this.children[i], arguments));
    }
    this.value = gep.executeBaseFunction(this.ch, args)
  }
  return this.value;
}

/**********************\
**** ExpressionTree ****
\**********************/

gep.ExpressionTree = function(exp){
  this.exp = exp;
  this.rows = [];
  this.root = null;
}

gep.ExpressionTree.createFromExpression = function(exp){
  var et = new gep.ExpressionTree(exp);
  et.rows[0] = exp[0];
  exp = exp.substring(1);
  for(var i=0,size;(size=gep.calcChildrenRowSize(et.rows[i])) > 0;i++)
  {
    et.rows[i+1] = exp.substring(0,size);
    exp = exp.substring(size);
  }
  return et;
}

gep.ExpressionTree.prototype.CreateTree = function(){
  //Copy Expression
  var rs = [];
  for(var i = 0;i < this.rows.length;i++)
  {
    rs[i] = this.rows[i].substring(0);
  }
  //Create Root Node
  this.root = new gep.Node(rs[0]);
  rs[0] = "";
  //Create Tree
  this.root.createChildren(rs,1);
}

gep.ExpressionTree.prototype.Execute = function()
{
  if(this.root == null)
  {
    this.CreateTree();
  }
  this.root.Execute.apply(this.root, arguments);
  return value = this.root.value;
}

/**********************\
**** Base Functions ****
\**********************/

//Basic Arithmetic
gep.addFunction("+",function(a,b){return a+b}); //Addition
gep.addFunction("-",function(a,b){return a-b}); //Subtraction
gep.addFunction("*",function(a,b){return a*b}); //Multiplication
gep.addFunction("/",function(a,b){return a/b}); //Division

//Advanced Arithmetic
//gep.addFunction("%",function(a,b){return a%b}); //Modulus
gep.addFunction("Q",function(a){return Math.sqrt(a)}); //Square Root

//Comparison Operators
//gep.addFunction("=",function(a,b){return a==b}); //Equality
//gep.addFunction("<",function(a,b){return a<b});  //Less Than
//gep.addFunction(">",function(a,b){return a>b});  //Greater Than

/*************
**** Test ****
*************/

var ET = gep.ExpressionTree.createFromExpression("*b+a-aQab+//+b+babbabbbababbaaa");
var a = 9;
var b = 1;
document.write("{" + ET.exp + "}(a=" + a + ",b=" + b + ") = " + ET.Execute(a,b));