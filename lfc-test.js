$(function() {
  var data = [];
  var item = $('.item');
  var options = $('.subject-options');
  var subjectLen = 0; //题目数量
  var optionLen = 0;
  $('#excel-file').change(function(e) {
    data = [];
    var files = e.target.files;
    var fileReader = new FileReader();
    $('.file-name').attr('placeholder', files[0].name);
    fileReader.onload = function(ev) {
      try {
        var result = ev.target.result,
          workbook = XLSX.read(result, {
            type: 'binary'
          }); // 以二进制流方式读取得到整份excel表格对象
      } catch (e) {
        console.log('文件类型不正确');
        return;
      }
      // 遍历每张表读取
      for (var sheet in workbook.Sheets) {
        if (workbook.Sheets.hasOwnProperty(sheet)) {
          data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
        }
      }
      subjectLen = data.length;
      $('#btnSubmit').attr('disabled', false);
      getSubject(0);
      getLibrary(0);
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);
  });
  $('#btnSubmit').attr('disabled', true);
  //选中答案
  options.on('click', function() {
      if (!$('.answer-box').text()) {
        var that = $(this);
        that.find('label').toggleClass('click');
      }
    })
    //提交答案添加效果 正确为绿色，错误为红色
  $('#btnSubmit').on('click', function() {
      var check = $(".radio.click")
      var index = $('.item').text() - 1; //题目序号
      var flag = 1; //题目对错
      if (!check.length) {
        alert('喂喂喂，别走神啊！都还没选，你怕是要上天')
      } else {
        for (var i = 0; i < optionLen; i++) {
          var option = options.eq(i).find('label');
          //是对的答案
          if (option.data('status') == 'true') {
            option.addClass('correct');
          } else {
            option.addClass('false');
          }
          //判断错误的条件,选中不对，对的没选中
          if ((option.data('status') == 'false' && option.hasClass('click'))||(option.data('status') == 'true' && !option.hasClass('click'))) {
            flag = 0;
          }

        }
        judgeStatus(flag, index);
        $('.answer-box').text(data[index]['答案']);
      }
    })
    //判断题目状态
  function judgeStatus(flag, index) {
    console.log(flag);
    var index = index % 100;
    if (flag == true) {
      $('.answer-sheet-num li').eq(index).find('a').removeClass('answering-wrong');
      $('.answer-sheet-num li').eq(index).find('a').addClass('answering-correct');
    } else {
      $('.answer-sheet-num li').eq(index).find('a').removeClass('answering-correct');
      $('.answer-sheet-num li').eq(index).find('a').addClass('answering-wrong');
    }
  };
  // ！！页数，题号都从0开始
  //获取题库,参数为范围[0-100]为0，[101-200]为1，以此类推
  function getLibrary(range) {
    //向上取整，例如1250就为13，因为从0开始，所以范围是[0-12]
    var fullRange = Math.ceil(subjectLen / 100) - 1;
    if (range < fullRange && range >= 0) {
      var len = 100;
      var str = '';
      // <li><a href="javascript:void(0);" data-index="14941">2</a></li>
      for (var i = 0; i < len; i++) {
        //题号
        var index = 100 * range + i + 1;
        str += '<li><a href="javascript:void(0);" data-index ="' + index + '">' + index + '</a></li>';

      }
      $('.answer-sheet-num').html(str);
    }
    //最后一页
    else if (range == fullRange) {
      var str = '';
      var len = subjectLen - range * 100;
      for (var i = 0; i < len; i++) {
        //题号
        var index = 100 * range + i + 1;
        str += '<li><a href="javascript:void(0);" data-index ="' + index + '">' + index + '</a></li>';

      }
      $('.answer-sheet-num').html(str);
    } else {
      alert('没有啦别点啦~');
    }
    $('.answer-sheet-num li').eq(0).find('a').addClass('answering-click');
  }
  //点击题库跳转
  $('.answer-sheet-num').on('click', 'li', function() {
      var that = $(this);
      var index = that.find('a').data('index');
      that.find('a').addClass('answering-click');
      getSubject(index - 1);
    })
    //下一页题库
  $('#btnNextPage').on('click', function() {
      var item = $('.item').text();
      var range = Math.ceil(item / 100) - 1;
      var index = (range + 1) * 100;
      getLibrary(range + 1);
      getSubject(index);
    })
    //上一页题库
  $('#btnLastPage').on('click', function() {
      var item = $('.item').text();
      var range = Math.ceil(item / 100) - 1;
      var index = (range - 1) * 100;
      getLibrary(range - 1);
      getSubject(index);
    })
    //获取题目,id为题目序号
  function getSubject(id) {
    if (id >= 0 && id <= subjectLen) {
      var subject = data[id];
      var answer = subject['答案'];
      var title = $('.subject-title');
      var question = $('.subject-question');
      optionLen = 0;
      $('.answer-box').text('');
      options.each(function() {
          $(this).addClass('hidden');
          $(this).find('label').removeClass('false');
          $(this).find('label').removeClass('click');
          $(this).find('label').removeClass('correct');
        })
        //设置题目类型
      title.text(subject['题型']);
      //设置题目
      question.text(subject['题干']);
      //设置题目序号
      item.text(subject['序号']);
      //设置选项
      for (var i = 0; i < 6; i++) {
        var index = i + 65,
          letter = '选项' + String.fromCharCode(index),
          option = options.eq(i);
        //选项存在
        if (subject[letter]) {
          optionLen++;
          option.find('label').data('status', 'false');
          option.find("pre").text(subject[letter]);
          option.removeClass('hidden');
        } else break;
      }
      //设置答案data-status
      for (var i = 0; i < answer.length; i++) {
        var index = answer.charCodeAt(i) - 65;
        option = options.eq(index);
        option.find('label').data('status', 'true');
      }
    }
  }
  //下一题
  $('#btnNext').click(function() {
      options.find('input').attr("disabled", false);
      var index = $('.item').text();
      if (index == data.length) {
        alert('最后一题啦！那你很棒棒哦~');
      } else getSubject(Number(index));
      $('.answer-sheet-num li').eq(Number(index)).find('a').addClass('answering-click');
    })
    //上一题
  $('#btnLast').click(function() {
    options.find('input').attr("disabled", false);
    var index = $('.item').text();
    if (index == 1) {
      alert('这是第一题！别偷懒~快开始刷')
    } else getSubject(Number(index) - 2);
    $('.answer-sheet-num li').eq(Number(index) - 2).find('a').addClass('answering-click');
  })

})