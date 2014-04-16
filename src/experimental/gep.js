/*****************\
**** Terminals ****
\*****************/

//Terminal Model
var Terminal = Backbone.Model.extend({
  defaults: {
    character: ""
  }
});

//Terminal List Item View
var TerminalListItemView = Backbone.View.extend({
  className: "list-item",
  initialize: function(){
    this.render();
    this.listenTo(this.model, "change", this.render);
  },
  
  template: _.template("<%= character %>"),
  
  render: function(){
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

//Terminal Collection
var TerminalCollection = Backbone.Collection.extend({
  model: Terminal
});

$(function(){

  terminals = new TerminalCollection();
  
  terminals.add([
    {character: "a"},
    {character: "b"},
    {character: "c"}
  ]);
  
  terminalsView = new UpdatingCollectionView({
    collection : terminals,
    childViewConstructor : TerminalListItemView,
    childViewTagName : "li",
  });
  
  terminalsView.el = $("#top");
  terminalsView.render();
});