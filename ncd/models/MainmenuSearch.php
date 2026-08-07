<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Mainmenu;

/**
 * MainmenuSearch represents the model behind the search form about `app\models\Mainmenu`.
 */
class MainmenuSearch extends Mainmenu
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['min_mnu_id', 'min_mnu_preference', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['min_mnu_name', 'min_mnu_desc', 'status','record_date'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        // bypass scenarios() implementation in the parent class
        return Model::scenarios();
    }

    /**
     * Creates data provider instance with search query applied
     *
     * @param array $params
     *
     * @return ActiveDataProvider
     */
    public function search($params)
    {
        $query = Mainmenu::find();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC],
            ],
        ]);
        if(empty($params))
            $params = Yii::$app->request->post();   
        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'min_mnu_id' => $this->min_mnu_id,
            'min_mnu_preference' => $this->min_mnu_preference,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
        ]);

        $query->andFilterWhere(['like', 'min_mnu_name', $this->min_mnu_name])
            ->andFilterWhere(['like', 'min_mnu_desc', $this->min_mnu_desc])
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}
