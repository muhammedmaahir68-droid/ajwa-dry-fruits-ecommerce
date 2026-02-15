export default function ProductReview({reviews}) {
    return (
        <div className="reviews w-75">
            <h3>Other's Reviews:</h3>
            <hr />
            {reviews && reviews.map(review => (
                <div key={review._id} className="review-card my-3">
                    <div className="rating-outer">
                        <div className="rating-inner" style={{width: `${review.rating/5*100}%`}}></div>
                    </div>
                    <span className="ml-2">{Number(review.rating || 0).toFixed(1)}/5</span>
                    <p className="review_user">by {review.user?.name || 'Customer'}</p>
                    <p className="review_comment">{review.comment}</p>
                    {review.image ? (
                      <img src={review.image} alt="review upload" style={{ maxWidth: '180px', borderRadius: '8px' }} />
                    ) : null}

                    <hr />
                </div>
            ))
            }
           
        </div>
    )
}
