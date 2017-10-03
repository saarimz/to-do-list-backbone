$(document).ready(function(){
    
    let data = [
        { id: 1, name: "Eat apples"},
        { id: 2, name: "Drink water"},
        { id: 3, name: "Get groceries"}
    ];

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

        initialize: function(){
        this.model.on("remove", this.removeItem, this);
        this.model.on("add",this.addItem, this);
        },

        removeItem: function(item){
            this.$("li#"+item.id).remove();
        },

        addItem: function(item){
            this.render();
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


    //instantiate
    let toDoItems = new ToDoItems(data.map(function(item){
        return new ToDoItem(item);
    }));

    let toDoList = new ToDoList({model: toDoItems});
    toDoList.render();

    //TO DO: Convert this to backbone.js from jquery
    $("#add-button").click(function(e){
        e.preventDefault();
        let input = $("#list-input").val();
        toDoItems.add(new ToDoItem({name: input}));
        $("#list-input").val("");
    });

    //TO DO: Convert this to backbone.js from jquery
    $("#clear-button").click(function(e){
        e.preventDefault();
        $(".main-list").html("")
        toDoItems.reset();
    });

});