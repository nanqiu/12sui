!function(){if(!window.addEventListener)return"您的浏览器不支持该网站，请升级！";{var t={},e=Backbone.Model.extend({getList:function(){var t=this;$.ajax({url:"./article/list.json",type:"get",dateType:"json",success:function(e){t.set("list",e)},failure:function(){alert("列表读取失败，请刷新重试！")}})},getArticle:function(e){var i=this;return t[e]?i.set("article",t[e]):void $.ajax({url:"./article/"+e+".html",type:"get",dateType:"text",success:function(l){i.set("article",l),t[e]=l},failure:function(){alert("文章读取失败，请刷新重试！")}})}}),i=Backbone.View.extend({tagName:"div",className:"side",initialize:function(){this.listenTo(this.model,"change:list",this.render),this.listenTo(this.model,"change:articleId",this.highlight),this.listenTo(this.model,"change:tagId",this.filter),this.listenTo(this.model,"change:listRenderTime",this.highlight),this.listenTo(this.model,"change:listRenderTime",this.filter)},render:function(){var t=this.model.get("list"),e=t.tags,i=t.lists,l='<h1><a href="#">我才<strong>12</strong>岁</a></h1><div class="tag"><ul>';e.forEach(function(t){l+='<li class="tag-'+t.link+'"><a href="#tag/'+t.link+'">'+t.name+"</a></li>"}),l+='</ul></div><div class="list"><ul>',i.forEach(function(t){l+='<li class="tag-'+t.tag+" link-"+t.href+'"><a href="#article/'+t.href+'" data-tag="'+t.tag+'" data-date="'+t.date+'">'+t.title+"</a></li>"}),l+="</ul>",$("aside").append(this.$el.html(l)).addClass("hide-loading"),this.model.set("listRenderTime",(new Date).getTime())},highlight:function(){this.model.get("list")&&this.$el.find("li").removeClass("here").end().find(".link-"+this.model.get("articleId")).addClass("here")},filter:function(){if(this.model.get("list")){var t,e=this.model.get("tagId");t=e?this.$el.find(".list").find("li").addClass("hidden").filter(".tag-"+this.model.get("tagId")).removeClass("hidden"):this.$el.find(".list").find("li").removeClass("hidden"),this.model.set("articleId",t.length?$("a",t[0]).attr("href").replace(/^.+\//,""):null)}}}),l=Backbone.View.extend({tagName:"div",className:"main",initialize:function(){this.listenTo(this.model,"change:article",this.render)},render:function(){this.$el.html(this.model.get("article")||'<div class="no-article">暂无文章信息！</div>').appendTo("article").parent().addClass("hide-loading").end().find("img.lazy").lazyload()}}),s=Backbone.Router.extend({initialize:function(t){{var s=this.model=new e;new i({model:s}),new l({model:s})}s.on("change:articleId",function(t,e){e?s.getArticle(e):s.set("article",null)}),Backbone.history.start()},routes:{"":"list","article/:query":"article","tag/:query":"tag"},list:function(t){this.model.get("list")?t||this.model.set("tagId",null):this.model.getList(),window.scrollTo(0,0)},article:function(t){this.model.get("list")||this.list("article"),this.model.set("articleId",t),window.scrollTo(0,$("article").offset().top)},tag:function(t){this.model.set("tagId",t),this.model.get("list")||this.list("tag"),window.scrollTo(0,0)}});new s}}();