<?php
namespace app\components;

use app\base\Common;
use yii\widgets\Menu;
use yii\helpers\ArrayHelper;
use yii\helpers\Url;
use yii\helpers\Html;

class MyMenu extends Menu {
    protected function renderItems($items)
    {
        $n = count($items);
        $lines = [];
        foreach ($items as $i => $item) {
            $visible = true;
            if(isset($item['linkOptions']['title']) && $item['linkOptions']['title'] != 'List' && $item['linkOptions']['title'] != 'View' && $item['linkOptions']['title'] != 'Generate')
                $visible = Common::getPrivileges($item['linkOptions']['title']);
            if($visible) {
                $options = array_merge($this->itemOptions, ArrayHelper::getValue($item, 'options', []));
                $tag = ArrayHelper::remove($options, 'tag', 'li');
                $class = [];
                if ($item['active']) {
                    $class[] = $this->activeCssClass;
                }
                if ($i === 0 && $this->firstItemCssClass !== null) {
                    $class[] = $this->firstItemCssClass;
                }
                if ($i === $n - 1 && $this->lastItemCssClass !== null) {
                    $class[] = $this->lastItemCssClass;
                }
                if (!empty($class)) {
                    if (empty($options['class'])) {
                        $options['class'] = implode(' ', $class);
                    } else {
                        $options['class'] .= ' ' . implode(' ', $class);
                    }
                }

                $menu = $this->renderItem($item);
                if (!empty($item['items'])) {
                    $submenuTemplate = ArrayHelper::getValue($item, 'submenuTemplate', $this->submenuTemplate);
                    $menu .= strtr($submenuTemplate, [
                        '{items}' => $this->renderItems($item['items']),
                    ]);
                }
                $lines[] = Html::tag($tag, $menu, $options);
            }
        }

        return implode("\n", $lines);
    }

    protected function renderItem($item)
    {
        if (isset($item['url'])) {
            $template = ArrayHelper::getValue($item, 'template', $this->linkTemplate);
			return Html::a($item['label'], $item['url'], $item['linkOptions']);

            return strtr($template, [
                '{url}' => Html::encode(Url::to($item['url'])),
                '{label}' => $item['label'],
            ]);
        } else {
            $template = ArrayHelper::getValue($item, 'template', $this->labelTemplate);

            return strtr($template, [
                '{label}' => $item['label'],
            ]);
        }
    }
}
?>