let ToDoItem = Backbone.Model.extend({
    defaults: {
        name: '',
        timestamp: new Date(Date.now()),
        completed: false
    },

    toggle: function(){
        this.save({
            completed: !this.get('completed')
        });
    }
});

let ToDoItems = Backbone.Collection.extend({
    model: ToDoItem
});

let ToDoItemView = Backbone.View.extend({

    tagName: 'li',

    events: {
        'click .delete-button' : 'submit'
    },

    template: _.template("#to-do-item"),

    init: function(){
        this.render();
    },
    
    render: function(){
        let self = this;
        this.$el.html(this.template(this.model.toJSON()));
        return self;
    },

    submit: function(){
        console.log("Button pressed!");
    }
});

let ToDoList = Backbone.View.extend({

    el: ".main-list",

    initialize: function(){
        this.render();
    },

    render: function(){
        console.log("View Loaded");
        return this;
    }
}); 

