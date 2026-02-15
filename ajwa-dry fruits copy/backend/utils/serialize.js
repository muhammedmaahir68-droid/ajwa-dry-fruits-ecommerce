function toPlain(model) {
    return model && typeof model.toJSON === 'function' ? model.toJSON() : model;
}

function withMongoId(obj) {
    if (!obj) return obj;
    return { ...obj, _id: obj.id };
}

function serializeUser(user) {
    const data = withMongoId(toPlain(user));
    if (!data) return data;
    delete data.password;
    return data;
}

function serializeProduct(product) {
    const data = withMongoId(toPlain(product));
    if (!data) return data;

    data.images = (data.images || []).map((img, index) => ({
        _id: img._id || `${data.id}-${index + 1}`,
        image: img.image
    }));

    data.reviews = (data.reviews || []).map((review, index) => ({
        _id: review._id || `${data.id}-r-${index + 1}`,
        user: review.user,
        rating: Number(review.rating),
        comment: review.comment
    }));

    return data;
}

function serializeOrder(order) {
    const data = withMongoId(toPlain(order));
    if (!data) return data;

    data.orderItems = (data.orderItems || []).map((item) => ({
        ...item,
        product: item.product,
        quantity: Number(item.quantity)
    }));

    return data;
}

module.exports = {
    serializeUser,
    serializeProduct,
    serializeOrder
};
