String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

gep = {};

gep.geneDef = {};
gep.geneDef.headSize = 10;
gep.geneDef.getTailSize = function(){
  return this.headSize * (gep.terminals.length - gep.terminalsOffset - 1) + 1;
}

gep.createRandomGene = function(){
  var maxHeadRand = gep.baseFunctions.length + gep.terminals.length;
  var maxTailRand = gep.terminals.length;
  var gene = "";
  var geneLength = gep.geneDef.headSize + 2 * gep.geneDef.getTailSize();
  var random;
  while(gene.length < geneLength)
  {
    if(gene.length < gep.geneDef.headSize)
    {
      random = Math.floor(maxHeadRand * Math.random());
      if(random < gep.baseFunctions.length)
      {
        gene += gep.baseFunctions[random];
      }
      else
      {
        gene += gep.terminals[random % gep.baseFunctions.length];
      }
    }
    else if(gene.length < gep.geneDef.headSize + gep.geneDef.getTailSize())
    {
      random = Math.floor(maxTailRand * Math.random());
      gene += gep.terminals[random];
    }
    else
    {
      random = Math.floor(10 * Math.random());
      gene += random;
    }
  }
  return gene;
}

gep.terminals = ["a","b","?"];
gep.terminalsOffset = 1;
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

gep.Node = function(ch, et){
  this.ch = ch[0];
  this.et = et;
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
  if(this.ch == "?")
  {
    this.value = et.getRandom();
  }
}

gep.Node.prototype.createChildren = function(rows, row, et){
  for(var i=0;i<gep.getNumberOfArgs(this.ch);i++,rows[row]=rows[row].substring(1))
  {
    this.children.push(new gep.Node(rows[row], et));
  }
  for(var i=0;i<this.children.length;i++)
  {
    this.children[i].createChildren(rows, row+1, et);
  }
}

gep.Node.prototype.Execute = function(){
  if(this.terminal)
  {
    if(this.ch != "?")
    {
      this.value = arguments[gep.getTerminalIndex(this.ch)];
    }
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
  this.randoms = null;
  this.lastMutation = -1;
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

gep.ExpressionTree.prototype.createMutation = function(){
  var exp = this.exp.substring(0);
  var geneLength = gep.geneDef.headSize + 2 * gep.geneDef.getTailSize();
  var position = Math.floor(geneLength * Math.random());
  var maxHeadRand = gep.baseFunctions.length + gep.terminals.length;
  var maxTailRand = gep.terminals.length;
  var random;
  if(position < gep.geneDef.headSize)
  {
    random = Math.floor(maxHeadRand * Math.random());
    if(random < gep.baseFunctions.length)
    {
      exp = exp.replaceAt(position, gep.baseFunctions[random]);
    }
    else
    {
      exp = exp.replaceAt(position, gep.terminals[random % gep.baseFunctions.length]);
    }
  }
  else if(position < gep.geneDef.headSize + gep.geneDef.getTailSize())
  {
    random = Math.floor(maxTailRand * Math.random());
    exp = exp.replaceAt(position, gep.terminals[random]);
  }
  else
  {
    random = Math.floor(10 * Math.random());
    exp = exp.replaceAt(position, random + "");
  }
  var newET = gep.ExpressionTree.createFromExpression(exp);
  newET.lastMutation = position;
  return newET;
}

gep.ExpressionTree.prototype.getRandom = function(){
  var n = this.randoms[0];
  this.randoms = this.randoms.substring(1);
  return parseInt(n);
}

gep.ExpressionTree.prototype.CreateTree = function(){
  //Copy Expression
  var rs = [];
  for(var i = 0;i < this.rows.length;i++)
  {
    rs[i] = this.rows[i].substring(0);
  }
  //Create Root Node
  this.root = new gep.Node(rs[0], this);
  rs[0] = "";
  //Create Tree
  this.root.createChildren(rs,1,this);
}

gep.ExpressionTree.prototype.Execute = function()
{
  if(this.root == null)
  {
    this.randoms = this.exp.substring(gep.geneDef.headSize + gep.geneDef.getTailSize());
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
//gep.addFunction("Q",function(a){return Math.sqrt(a)}); //Square Root

//Comparison Operators
//gep.addFunction("=",function(a,b){return a==b}); //Equality
//gep.addFunction("<",function(a,b){return a<b});  //Less Than
//gep.addFunction(">",function(a,b){return a>b});  //Greater Than

/************\
**** Test ****
\************/

var pop = 2;
var ETs = [];

for(var i=0;i<pop;i++)
{
  ETs[i] = gep.ExpressionTree.createFromExpression(gep.createRandomGene());
}

var getFitness = function(et)
{
  baseFitness = 0;
  for(var i = 0; i < 100; i++)
  {
    for(var j = 0; j < 100; j++)
    {
      baseFitness -= Math.abs(j*(j + 1) + 2 * i - et.Execute(i,j));
    }
  }
  if(isNaN(baseFitness))
  {
    return -Infinity;
  }
  else
  {
    return baseFitness;
  }
}

var lastFitness = 0;
var staticGenerations = 0;
var generation = 0;

var print = function(et, f)
{
  if(et.lastMutation == -1)
  {
    $("#content").prepend(generation + ": {" + et.exp + "} Fitness: " + f + " No Change in " + staticGenerations + " Generations.<br />");
  }
  else
  {
    var text = et.exp.substring(0,et.lastMutation) +
    "<div class=\"mutation\">" + et.exp[et.lastMutation] +"</div>" + 
    et.exp.substring(et.lastMutation + 1);
    $("#content").prepend(generation + ": {" + text + "} Fitness: " + f + " No Change in " + staticGenerations + " Generations.<br />");
  }
}

var runGeneration = function()
{
  generation++;
  var best = ETs[0];
  var bestFitness = getFitness(best);
  for(var i=1;i<pop;i++)
  {
    var fitness = getFitness(ETs[i]);
    if(fitness >= bestFitness - staticGenerations * Math.random())
    {
      best = ETs[i];
      bestFitness = fitness;
    }
  }
  if(bestFitness == lastFitness)
  {
    staticGenerations++;
  }
  else
  {
    staticGenerations = 0;
    lastFitness = bestFitness;
  }
  print(best, bestFitness);
  ETs[0] = best;
  for(var i=1;i<pop;i++)
  {
    ETs[i] = best.createMutation();
  }
}

$(function(){
  print(ETs[0], getFitness(ETs[0]));
  
  setInterval(function(){runGeneration();}, 50);

  /*
  var count = 10;
  ETs = [];
  ETs.push(gep.ExpressionTree.createFromExpression(gep.createRandomGene()));
  for(var i = 1;i<count;i++)
  {
    ETs.push(ETs[i-1].createMutation());
  }
  var a = 9;
  var b = 1;
  for(var i = 0;i<count;i++)
  {
    if(ETs[i].lastMutation == -1)
    {
      $("#content").append("{" + ETs[i].exp + "}(a=" + a + ",b=" + b + ") = " + ETs[i].Execute(a,b) + "<br />");
    }
    else
    {
      var text = ETs[i].exp.substring(0,ETs[i].lastMutation) +
      "<div class=\"mutation\">" + ETs[i].exp[ETs[i].lastMutation] +"</div>" + 
      ETs[i].exp.substring(ETs[i].lastMutation + 1);
      $("#content").append("{" + text + "}(a=" + a + ",b=" + b + ") = " + ETs[i].Execute(a,b) + "<br />");
    }
  }*/
});