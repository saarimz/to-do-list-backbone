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
            this.model.on("add",this.render, this);
            this.model.on("reset",this.render, this)
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
        },

        onClickAdd: function(e){
            e.preventDefault();
            let input = $("#list-input");
            this.model.add(new ToDoItem({name: input.val()}));
            input.val("");
        },

        onClickClear: function(e){
            e.preventDefault();
            this.model.reset();
        }


    });


    let app = {

        start: function(){
            //instantiate
            let toDoItems = new ToDoItems(data.map(function(item){
                return new ToDoItem(item);
            }));

            let toDoList = new ToDoList({model: toDoItems});
            let inputView = new InputView({ model: toDoItems});
            toDoList.render();
        }
    }

    app.start();

});