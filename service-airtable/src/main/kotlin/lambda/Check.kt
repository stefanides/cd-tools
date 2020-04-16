package lambda

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import kotlinx.html.*
import kotlinx.html.stream.createHTML

class Check : RequestHandler<Any, HtmlResponse> {
    override fun handleRequest(input: Any?, context: Context?): HtmlResponse {
        return HtmlResponse(
            statusCode = 200,
            body = createHTML().html {
                body {
                    style = "text-align: center; padding: 32px;"
                    h1 {
                        +"OK"
                    }
                }
            }
        )
    }
}