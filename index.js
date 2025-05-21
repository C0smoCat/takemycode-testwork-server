const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());

// Генерация миллиона элементов
const items = Array.from({ length: 1_000_000 }, (_, i) => ({
    id: i + 1,
    value: `Значение ${ i + 1 }`,
    selected: false,
}));

app.use((req, res, next) => {
    console.log(`${ req.method } ${ req.url }`);
    next();
});

// Получение элементов с пагинацией
app.get('/api/items', (req, res) => {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const search = req.query.search;

    const offset = (page - 1) * limit;

    let filteredItems = items;

    if (search && search.length > 0) {
        filteredItems = items.filter(item =>
            item.value.toLowerCase().includes(search.toLowerCase())
        );
    }

    const paginatedItems = filteredItems.slice(offset, offset + limit);

    res.json({
        items: paginatedItems,
        total: filteredItems.length,
    });
});

// Обновление выбранных элементов
app.post('/api/items/select', (req, res) => {
    const { id, selected } = req.body;

    const item = items.find(item => item.id === id);
    if (item) {
        item.selected = selected === true;
    }

    res.json({ success: true });
});

// Обновление порядка элементов
app.post('/api/items/order', (req, res) => {
    const { itemId, afterId } = req.body;

    const itemIndex = items.findIndex(item => item.id === itemId);

    if (afterId === null) {
        arrayMove(items, itemIndex, 0);
    } else {
        const afterIndex = items.findIndex(item => item.id === afterId);
        arrayMove(items, itemIndex, afterIndex + 1);
    }

    console.log(itemId, afterId, items.slice(0, 50).map(e => e.id).join(','));

    res.json({ success: true });
});

function arrayMove(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        let k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index > old_index ? new_index - 1 : new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
}

app.listen(PORT, () => {
    console.log(`Server running on port ${ PORT }`);
});
