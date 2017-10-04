$(document).ready(function(){
    //create item model
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
    //create items collection
    let ToDoItems = Backbone.Collection.extend({
        model: ToDoItem
    });
    //create item view
    let ToDoItemView = Backbone.View.extend({
        //create class and tag
        tagName: 'li',
        className: 'list-item',
        //listen to dom events
        events: {
            'click .delete-button' : 'delete',
            'click #item-name' : 'strike' 
        },

        initialize: function(){
            let self = this;
            //listen to model event
            self.model.on("change",function(item){
                if (item.get("completed")) {
                    self.$el.find("#item-name").addClass("completed");
                }
                else {
                    self.$el.find("#item-name").removeClass("completed");
                }
            },self);
        },
        //use the template outlined in index.html for rendering
        template: _.template($("#to-do-item").html()),
        //create HTML
        render: function(){
            let self = this;
            let html = self.template(self.model.toJSON());
            self.$el.html(html);
            return self;
        },
        //remove model
        delete: function(){
            this.remove();
        },
        //change state of model
        strike: function(){
            this.model.toggle();
        }
    });

    let ToDoList = Backbone.View.extend({
        //attach to main-list
        el: ".main-list",

        initialize: function(options){
            //model events
            this.model.on("remove", this.removeItem, this);
            this.model.on("add",this.render, this);
            this.model.on("reset",this.render, this);
            this.model.on("all",this.alertClearButton,this);
            //bus event handling
            this.bus = options.bus;
            this.bus.on("addItem",this.addItem,this);
            this.bus.on("clearList",this.clearList,this);
        },
        //add item to collection
        addItem: function(params) {
            this.model.add(new ToDoItem(params));
        },
        //empty the collection
        clearList: function(){
            this.model.reset();
        },
        //remove item from collection
        removeItem: function(item){
            this.$("li#"+item.id).remove();
        },
        //to alert clear button by setting off listAction event
        alertClearButton: function(){
            this.bus.trigger("listAction", this.model.length);
        },
        //render collection by creating a view for each model and appending it to DOM
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
        //attach view to el
        el: ".input-view",
        
        //DOM events
        events: {
            'click #add-button' : 'onClickAdd',
            'click #clear-button' : 'onClickClear',
            'keyup #list-input' : 'onKeyUp'
        },

        initialize: function(options){
            //disable buttons by default
            $("#add-button").prop('disabled', true);
            $("#clear-button").prop('disabled', true);
            //create the bus
            this.bus = options.bus;
            //listen to listAction event triggered by bus
            this.bus.on("listAction",this.itemIsPresent,this);
        },
        //grab listAction event to see if Clear button should be enabled or disabled
        itemIsPresent: function(modelLength){
            (modelLength) ? ($("#clear-button").prop('disabled', false)) : ($("#clear-button").prop('disabled', true));
        },
        //trigger event to listview to add an item to the collection
        onClickAdd: function(e){
            e.preventDefault();
            let input = $("#list-input");
            if (input.val()) {
                this.bus.trigger("addItem",{name: input.val()});
                input.val("");
                $("#add-button").prop('disabled', true);
            }
        },
        //if there is nothing in input field, disable submit button. otherwise enable
        onKeyUp: function(){
            let input = $("#list-input");
            (input.val().length) ? ($("#add-button").prop('disabled', false)) : ($("#add-button").prop('disabled', true));
        },
        //trigger bus event to clear list
        onClickClear: function(e){
            e.preventDefault();
            this.bus.trigger("clearList");
        }
    });


    let app = {

        start: function(){
            //default data:
            //TO DO: Pull from localStorage
            let data = [];

            //generate collections array
            let toDoItems = new ToDoItems(data.map(function(item){
                return new ToDoItem(item);
            }));
            //create bus for custom event routing between the two views
            let bus = _.extend({},Backbone.Events);
            //for the list view
            let toDoList = new ToDoList({model: toDoItems, bus: bus});
            //for the input view
            let inputView = new InputView({ bus: bus});
            toDoList.render();
        }
    }
    //start the app
    app.start();

});