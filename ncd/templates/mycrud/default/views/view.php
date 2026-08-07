<?php

use yii\helpers\Inflector;
use yii\helpers\StringHelper;

$class = $generator->modelClass;
$pk = $class::primaryKey()[0];

/* @var $this yii\web\View */
/* @var $generator yii\gii\generators\crud\Generator */

$urlParams = $generator->generateUrlParams();

echo "<?php\n";
?>

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model <?= ltrim($generator->modelClass, '\\') ?> */

$this->title = <?= $generator->generateString('View {modelClass} ', ['modelClass' => Inflector::camel2words(StringHelper::basename($generator->modelClass))]) ?>;
$this->params['breadcrumbs'][] = ['label' => <?= $generator->generateString(Inflector::pluralize(Inflector::camel2words(StringHelper::basename($generator->modelClass)))) ?>, 'url' => ['index']];
$this->params['breadcrumbs'][] = <?= $generator->generateString('View') ?>;
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', <?= $urlParams ?>]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', <?= $urlParams ?>]],
];
?>
<div class="<?= Inflector::camel2id(StringHelper::basename($generator->modelClass)) ?>-view">

    <h1><?= "<?= " ?>Html::encode($this->title) ?></h1>

    <?= "<?= " ?>DetailView::widget([
        'model' => $model,
        'attributes' => [
<?php
if (($tableSchema = $generator->getTableSchema()) === false) {
    foreach ($generator->getColumnNames() as $name) {
        echo "            '" . $name . "',\n";
    }
} else {
    foreach ($generator->getTableSchema()->columns as $column) {
        $format = $generator->generateColumnFormat($column);
        // echo "\t\t\t'" . $column->name . ($format === 'text' ? "" : ":" . $format) . "',\n";
		// echo "            '" . $column->name . ($format === 'text' ? "" : ":" . $format) . "',\n";
        if($format === 'text' && $column->name != "status" && $column->name != "del_status" && $column->name != "create_user" && $column->name != "update_user" && $column->name != $pk)
			echo "\t\t\t'" . $column->name . "',\n";
		elseif($column->name == $pk)
			echo "\t\t\t// '" . $column->name . "',\n";
		elseif($format === 'text' && $column->name == "status")
			echo "\t\t\t[\n\t\t\t\t'attribute' => '" . $column->name . "',\n\t\t\t\t'value' => (\$model->" . $column->name . " == 1) ? 'Y' : 'N',\n\t\t\t\t'visible' => (\$model->" . $column->name . " === null) ? false : true,\n\t\t\t],\n";
		elseif($column->name == "create_time")
			echo "\t\t\t[\n\t\t\t\t'attribute' => '" . $column->name . "',\n\t\t\t\t'format' => '" . ($format === 'text' ? "" : $format) . "',\n\t\t\t\t'visible' => (\$model->update_user !== null) ? false : true,\n\t\t\t],\n";
		elseif($column->name == "create_user")
			echo "\t\t\t[\n\t\t\t\t'attribute' => '" . $column->name . "',\n\t\t\t\t'visible' => (\$model->update_user !== null) ? false : true,\n\t\t\t],\n";
		elseif($column->name == "update_time")
			echo "\t\t\t[\n\t\t\t\t'attribute' => '" . $column->name . "',\n\t\t\t\t'format' => '" . ($format === 'text' ? "" : $format) . "',\n\t\t\t\t'visible' => (\$model->update_user === null) ? false : true,\n\t\t\t],\n";
		elseif($column->name == "update_user")
			echo "\t\t\t[\n\t\t\t\t'attribute' => '" . $column->name . "',\n\t\t\t\t'visible' => (\$model->update_user === null) ? false : true,\n\t\t\t],\n";
		elseif($column->name != "del_status") {
			echo "\t\t\t[\n\t\t\t\t'attribute' => '" . $column->name . "',\n\t\t\t\t'format' => '" . ($format === 'text' ? "" : $format) . "',\n\t\t\t\t'visible' => (\$model->" . ($format === 'datetime' ? "update_user" : $column->name) . ") \n\t\t\t],\n";
		}
    }
}
?>
        ],
    ]) ?>

</div>
<div class="control-group buttons">
	<?= "<?= " ?>Html::Button('Back', array('class'=>'btn btn-default', 'onclick' => 'js:document.location.href="../'.Yii::$app->controller->id.'"')); ?>
</div>
<br/>