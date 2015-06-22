;
(function() {

    if (!window.addEventListener) {
        return '您的浏览器不支持该网站，请升级！';
    }

    if (/Mac\s+OS/.test(navigator.userAgent)) {
        $('body').addClass('sys-mac');
    }

    var cache = {};

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
            if (cache[id]) {
                return host.set('article', cache[id]);
            }
            $.ajax({
                url: './article/' + id + '.html',
                type: 'get',
                dateType: 'text',
                success: function(data) {
                    host.set('article', data);
                    cache[id] = data;
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
            this.listenTo(this.model, 'change:articleId', this.highlight);
            this.listenTo(this.model, 'change:tagId', this.filter);
            this.listenTo(this.model, 'change:listRenderTime', this.highlight);
            this.listenTo(this.model, 'change:listRenderTime', this.filter);
        },
        render: function() {
            var data = this.model.get('list');
            var tags = data.tags;
            var lists = data.lists;
            var html = '<h1><a href="#">我才<strong>12</strong>岁</a></h1><div class="tag"><ul>';
            tags.forEach(function(t) {
                html += '<li class="tag-' + t.link + '"><a href="#tag/' + t.link + '">' + t.name + '</a></li>';
            });
            html += '</ul></div><div class="list"><ul>';
            lists.forEach(function(l) {
                html += '<li class="tag-' + l.tag + ' link-' + l.href + '"><a href="#article/' + l.href + '" data-tag="' + l.tag + '" data-date="' + l.date + '">' + l.title + '</a></li>';
            });
            html += '</ul>';
            $('aside').append(this.$el.html(html)).addClass('hide-loading');
            // 设置状态
            this.model.set('listRenderTime', new Date().getTime());
        },
        highlight: function() {
            if (this.model.get('list')) {
                this.$el
                    .find('li')
                    .removeClass('here')
                    .end()
                    .find('.link-' + this.model.get('articleId'))
                    .addClass('here');
            }
        },
        filter: function() {
            if (this.model.get('list')) {
                var tagId = this.model.get('tagId');
                var els;
                if (tagId) {
                    els = this.$el
                        .find('.list')
                        .find('li')
                        .addClass('hidden')
                        .filter('.tag-' + this.model.get('tagId'))
                        .removeClass('hidden');
                } else {
                    els = this.$el
                        .find('.list')
                        .find('li')
                        .removeClass('hidden');
                }
								if (!this.model.get('articleId')) {
									this.model.set('articleId', els.length ? $('a', els[0]).attr('href').replace(/^.+\//, '') : null);
								}
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
                .html(this.model.get('article') || '<div class="no-article">暂无文章信息！</div>')
                .appendTo('article')
                .parent()
                .addClass('hide-loading')
                .end()
                .find('img.lazy')
                .lazyload();
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

            model.on('change:articleId', function(m, c) {
                if (c) {
                    model.getArticle(c);
                } else {
                    model.set('article', null);
                }
            });

            Backbone.history.start();

        },

        routes: {
            '': 'list',
            'article/:query': 'article',
            'tag/:query': 'tag'
        },

        list: function(from) {
            if (!this.model.get('list')) {
                this.model.getList();
            } else if (!from) {
                this.model.set('tagId', null);
            }
            window.scrollTo(0, 0);
        },

        article: function(query) {
            if (!this.model.get('list')) {
                this.list('article');
            }
            this.model.set('articleId', query);
            window.scrollTo(0, $('article').offset().top);
        },

        tag: function(query) {
            this.model.set('tagId', query);
            if (!this.model.get('list')) {
                this.list('tag');
            }
            window.scrollTo(0, 0);
        }

    });

    var router = new Router();

})();
