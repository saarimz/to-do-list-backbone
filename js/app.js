$(document).ready(function(){

    let ToDoItem = Backbone.Model.extend({
        idAttribute: 'id',
        defaults: {
            name: '',
            timestamp: new Date(Date.now()),
            completed: false
        },

        toggle: function(){
            if (this.get('completed')) {
                this.set('completed',false);
            } else {
                this.set('completed',true);
            }
        }
    });

    let ToDoItems = Backbone.Collection.extend({
        model: ToDoItem
    });

    let ToDoItemView = Backbone.View.extend({

        tagName: 'li',
        className: 'list-item',

        events: {
            'click .delete-button' : 'delete',
            'click #item-name' : 'strike' 
        },

        initialize: function(){
            let self = this;
            self.model.on("change",function(item){
                if (item.get("completed")) {
                    self.$el.find("#item-name").addClass("completed");
                }
                else {
                    self.$el.find("#item-name").removeClass("completed");
                }
            },self);
        },

        template: _.template($("#to-do-item").html()),
        
        render: function(){
            let self = this;
            let html = self.template(self.model.toJSON());
            self.$el.html(html);
            return self;
        },

        delete: function(){
            this.remove();
        },

        strike: function(){
            this.model.toggle();
        }
    });

    let ToDoList = Backbone.View.extend({

        el: ".main-list",

        initialize: function(options){
            this.model.on("remove", this.removeItem, this);
            this.model.on("add",this.render, this);
            this.model.on("reset",this.render, this);
            this.model.on("")

            this.bus = options.bus;
            this.bus.on("addItem",this.addItem,this);
            this.bus.on("clearList",this.clearList,this);
        },

        addItem: function(params) {
            this.model.add(new ToDoItem(params));
        },

        clearList: function(){
            this.model.reset();
        },

        removeItem: function(item){
            this.$("li#"+item.id).remove();
        },

        render: function(){
            let self = this;
            self.$el.html("");
            this.model.each(function(item){
                let itemView = new ToDoItemView({model: item});
                self.$el.append(itemView.render().$el);
            })
            return self;
        }
    }); 

    let InputView = Backbone.View.extend({
        el: ".input-view",

        events: {
            'click #add-button' : 'onClickAdd',
            'click #clear-button' : 'onClickClear',
            'keyup #list-input' : 'onKeyUp'
        },

        initialize: function(options){
            $("#add-button").prop('disabled', true);
            $("#clear-button").prop('disabled', true);
            this.model.on("change reset add remove",this.itemIsPresent, this);
            
            this.bus = options.bus;
        },

        //TO DO - REFACTOR THIS PART
        itemIsPresent: function(){
            (this.model.length) ? ($("#clear-button").prop('disabled', false)) : ($("#clear-button").prop('disabled', true));
        },

        onClickAdd: function(e){
            e.preventDefault();
            let input = $("#list-input");
            if (input.val()) {
                this.bus.trigger("addItem",{name: input.val()});
                input.val("");
                $("#add-button").prop('disabled', true);
            }
        },

        onKeyUp: function(){
            let input = $("#list-input");
            (input.val().length) ? ($("#add-button").prop('disabled', false)) : ($("#add-button").prop('disabled', true));
        },

        onClickClear: function(e){
            e.preventDefault();
            this.bus.trigger("clearList");
        }
    });


    let app = {

        start: function(){
            //instantiate
            let data = [];

            let toDoItems = new ToDoItems(data.map(function(item){
                return new ToDoItem(item);
            }));

            let bus = _.extend({},Backbone.Events);
            let toDoList = new ToDoList({model: toDoItems, bus: bus});
            //TO DO: REMOVE MODEL REFERENCE IN INPUTVIEW
            let inputView = new InputView({ model: toDoItems, bus: bus});
            toDoList.render();
        }
    }

    app.start();

});