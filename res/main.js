;
(function() {

    // model
    var Model = Backbone.Model.extend({

        // 读取列表
        getList: function() {
            var host = this;
            $.ajax({
                url: './article/list.json',
                type: 'get',
                dateType: 'json',
                success: function(data) {
                    host.set('list', data);
                },
                failure: function() {
                    alert('列表读取失败，请刷新重试！');
                }
            });
        },

        // 读取文章
        getArticle: function(id) {
            var host = this;
            $.ajax({
                url: './article/' + id + '.html',
                type: 'get',
                dateType: 'text',
                success: function(data) {
                    host.set('article', data);
                },
                failure: function() {
                    alert('文章读取失败，请刷新重试！');
                }
            });
        }

    });

    // view
    var ListView = Backbone.View.extend({
        tagName: 'div',
        className: 'side',
        initialize: function() {
            this.listenTo(this.model, 'change:list', this.render);
            this.listenTo(this.model, 'change:current', this.highlight);
            this.listenTo(this.model, 'change:listRendered', this.highlight);
        },
        render: function() {
            var data = this.model.get('list');
            var tags = data.tags;
            var lists = data.lists;
            var html = '<div class="tag"><ul>';
            tags.forEach(function(t) {
                html += '<li class="tag-' + t.link + '"><a href="#' + t.link + '">' + t.name + '</a></li>';
            });
            html += '</ul></div><div class="list"><ul>';
            lists.forEach(function(l) {
                html += '<li class="tag-' + l.tag + ' link-' + l.href + '"><a href="#article/' + l.href + '" data-tag="' + l.tag + '" data-date="' + l.date + '">' + l.title + '</a></li>';
            });
            html += '</ul>';
            $('aside').append(this.$el.html(html)).addClass('hide-loading');
            // 设置状态
            this.model.set('listRendered', true);
        },
        highlight: function() {
            if (this.model.get('listRendered')) {
                this.$el
                    .find('li')
                    .removeClass('here')
                    .end()
                    .find('.link-' + this.model.get('current'))
                    .addClass('here');
            }
        }
    });

    var ArticleView = Backbone.View.extend({
        tagName: 'div',
        className: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:article', this.render);
        },
        render: function() {
            this.$el
                .html(this.model.get('article'))
                .appendTo('article')
                .parent()
                .addClass('hide-loading');
						window.scrollTo(0, 0);
        }
    });

    // router
    var Router = Backbone.Router.extend({

        initialize: function(options) {

            var model = this.model = new Model();

            var list = new ListView({
                model: model
            });
            var article = new ArticleView({
                model: model
            });

            Backbone.history.start();

        },

        routes: {
            '': 'list',
            'article/:query': 'article'
        },

        list: function() {
            this.model.getList();
        },

        article: function(query, page) {
            if (!this.model.get('listRendered')) {
                this.list();
            }
            this.model.getArticle(query);
            this.model.set('current', query);
        }

    });

    var router = new Router();

})();
