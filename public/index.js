import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {Bar} from 'react-chartjs-2';
import data from './data.json';

class RadioOption extends React.Component {
  render() {
    var classNames = ['radioOption'];

    if (this.props.isChecked) {
      classNames.push('selected');
    }

    return (
      <li>
        <input 
          type="radio" 
          value={this.props.value} 
          name={this.props.name} 
          className={classNames.join(' ')} 
          onChange={this.props.onAnswerChange}
          checked={this.props.isChecked}
        />
        {this.props.value} 
      </li>
    );
  }
}

class InputOption extends React.Component {
  render() {
    return (
      <div>
        <input 
          type="text" 
          value={this.props.value} 
          name={this.props.name} 
          className="inputOption" 
          onChange={this.props.onAnswerChange}
        />
      </div>
    );
  }
}

class OptionList extends React.Component {
  render() {

    var name = "question-" + this.props.index;

    if (!this.props.options || this.props.options.length === 0) {
      return (
        <InputOption 
          name={name} 
          value={this.props.userAnswer} 
          onAnswerChange={this.props.onAnswerChange} 
        />
      );
    }

    var tempThis = this;

    var optionList = this.props.options.map(function(option, index){
      return (
        <RadioOption 
          name={name} 
          key={index} 
          value={option}
          onAnswerChange={tempThis.props.onAnswerChange} 
          isChecked={option === tempThis.props.userAnswer}
        />
      );
    });
    return (
      <ul className="radioOptionList">
        {optionList}
      </ul>
    );
  }
}

class Question extends React.Component {
  render() {
    var classNames = ['question'];

    if (this.props.validationError && this.props.userAnswer === '') {
      classNames.push("invalid");
    }

    if (this.props.isSubmitted && this.props.userAnswer !== this.props.correctAnswer) {
      classNames.push("incorrect");
    }

    return (
      <div className={classNames.join(' ')}>
        {"Q" + (this.props.index + 1) + ": " + this.props.question}
        <OptionList 
          options={this.props.options} 
          index={this.props.index} 
          onAnswerChange={this.props.onAnswerChange}
          userAnswer={this.props.userAnswer}
        />
      </div>
    );
  }
}

class QuestionList extends React.Component {
  render() {
    if (this.props.questions.length === 0) {
      return (
        <div>No Questions!!</div>
      );
    }

    var tempThis = this;

    var questionList = this.props.questions.map(function(q, index) {
      return (
        <Question 
          key={index} 
          index={index} 
          question={q.question} 
          options={q.options} 
          onAnswerChange={tempThis.props.onAnswerChange}
          userAnswer={q.userAnswer}
          validationError={tempThis.props.validationError}
          isSubmitted={tempThis.props.isSubmitted}
          correctAnswer={q.answer}
        />
      );
    });

    return (
      <div className={"questionList"}>
        {questionList}
      </div>
    );
  }
}

class Questionnaire extends React.Component {
  constructor() {
    super();

    this.state={
      questions: [],
      validationError: false,
      isSubmitted: false
    };

    this.onAnswerChange = this.onAnswerChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onClear = this.onClear.bind(this);
  }

  componentWillMount() {
    var qs = _.clone(data);
    qs.forEach(function(q){
      q.userAnswer = '';
    });
    this.setState({
      questions: qs
    });
  }

  onAnswerChange(e) {
    var index = Number(e.target.name.split("-")[1]);
    var qs = _.clone(this.state.questions);
    qs[index].userAnswer = e.target.value;
    this.setState({
      questions: qs,
      validationError: false,
      isSubmitted: false
    });
  }

  onSubmit(e) {
    e.preventDefault();

    var validationErr = this.state.questions.every(function(q){
      return q.userAnswer !== '';
    });

    if (!validationErr) {
      this.setState({
        validationError: true
      });
      return;
    }

    this.setState({
      isSubmitted: true
    });
  }

  onClear(e) {
    var qs = _.clone(this.state.questions);
    qs.forEach(function(q){
      q.userAnswer = '';
    });
    this.setState({
      questions: qs,
      validationError: false,
      isSubmitted: false
    });
  }

  render() {
    var validationError;
    if (this.state.validationError) {
      validationError = (
        <div className="validationError">
          One or more Questions are un-answered
        </div>
      );
    }

    var chart;
    if (this.state.isSubmitted) {
      var incorrect = 0;
      var correct = 0;
      this.state.questions.forEach(function(q){
        if (q.userAnswer === q.answer) {
          correct++;
        } else {
          incorrect++;
        }
      });

      var data = {
        labels: ['correct', 'incorrect'],
        datasets: [
          {
            label: '# of correct vs incorrect',
            data: [correct, incorrect],
            backgroundColor: [
              "#2ecc71",
              "#3498db"
            ]
          }
        ]
      };

      chart = (
        <Bar
            data={data}
            width={100}
            height={50}
            options={{
                maintainAspectRatio: false,
                title: {
                  display: true,
                  text: 'correct vs incorrect'
                }
            }}
        />
      );
    }

    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <QuestionList 
            questions={this.state.questions} 
            onAnswerChange={this.onAnswerChange} 
            validationError={this.state.validationError}
            isSubmitted={this.state.isSubmitted}
          />
          {validationError}
          <input type="submit" value="submit" />
          <input type="button" value="clear" onClick={this.onClear} />
        </form>
        {chart}
      </div>
    );
  }
}

ReactDOM.render(
  <Questionnaire />,
  document.getElementById('container')
);
